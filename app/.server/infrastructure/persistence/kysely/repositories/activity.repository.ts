import type { InferResult, Insertable, Kysely, Transaction } from 'kysely';
import type { DB } from '../types/db';
import crypto from 'node:crypto';
import type {
	ActivityRepository,
	CreateActivity,
} from '~/.server/core/ports/spi/persistence/activity.repository';
import type { Activity, ActivityId } from '~/.server/core/models/activity';
import type { PersonId } from '~/.server/core/models/person';
import { generateId } from '~/.server/infrastructure/generators/id.generator';

const query = (db: Kysely<DB>) =>
	db
		.selectFrom('activity')
		.innerJoin('activity_type', 'activity_type.id', 'activity.type_id')
		.innerJoin('activity_guest', 'activity_guest.activity_id', 'activity.id')
		.select((eb) => [
			'activity.id',
			'activity.date',
			'activity.name',
			'activity.description',
			'activity.host_id',
			'activity_type.name as type',
			eb.fn
				.coalesce(
					eb.fn<string>('group_concat', ['activity_guest.guest_id']),
					eb.val(''),
				)
				.as('guestIds'),
		]);

type ActivityWithGuests = InferResult<ReturnType<typeof query>>[number];
export class KyselyActivityRepository implements ActivityRepository {
	constructor(
		protected readonly db: Kysely<DB>,
		protected readonly generateActivityId = generateId('ac'),
		protected readonly generateActivityTypeId = generateId('act'),
	) {}

	#toDomain(activity: ActivityWithGuests): Activity {
		const { id, guestIds, host_id, ...rest } = activity;
		const guestIdsArray = guestIds.split(',').filter(Boolean); // TODO: parse using zod or similar
		return {
			id: id as ActivityId,
			...rest,
			date: new Date(activity.date),
			host_id: host_id as PersonId,
			guestIds: guestIdsArray.map((guestId) => guestId as PersonId),
		};
	}

	async find(id: ActivityId) {
		const activity = await query(this.db)
			.where('activity.id', '=', id)
			.executeTakeFirst();
		if (!activity) return null;
		return this.#toDomain(activity);
	}

	async #findOrThrow(id: ActivityId) {
		const activity = await this.find(id);
		if (!activity) {
			throw new Error(`Activity with id ${id} not found`);
		}
		return activity;
	}

	async findByHost(hostId: PersonId) {
		const activities = await query(this.db)
			.where('activity.host_id', '=', hostId)
			.groupBy(['activity.id'])
			.execute();
		return activities.map(this.#toDomain.bind(this));
	}

	async #execInTransaction<T>(op: (trx: Transaction<DB>) => Promise<T>) {
		return await this.db.transaction().execute(op);
	}

	async #getOrCreateActivityType(
		trx: Transaction<DB>,
		type: Insertable<DB['activity_type']>,
	) {
		const result = await trx
			.insertInto('activity_type')
			.values(type)
			.onConflict((oc) => oc.doNothing())
			.returning('id')
			.executeTakeFirstOrThrow();

		return result.id;
	}

	async #createActivity(
		trx: Transaction<DB>,
		activity: Insertable<DB['activity']>,
	) {
		const created = await trx
			.insertInto('activity')
			.values(activity)
			.returning('id')
			.executeTakeFirstOrThrow();
		return created.id as ActivityId;
	}

	async #addGuests(
		trx: Transaction<DB>,
		activityId: ActivityId,
		guestIds: PersonId[],
	) {
		await trx
			.insertInto('activity_guest')
			.values(
				guestIds.map((guestId) => ({
					activity_id: activityId,
					guest_id: guestId,
				})),
			)
			.execute();
	}

	async create(activity: CreateActivity) {
		const { type, guestIds, ...rest } = activity;
		const createdActivity = await this.#execInTransaction(async (trx) => {
			const typeId = await this.#getOrCreateActivityType(trx, {
				id: this.generateActivityTypeId(),
				name: type,
			});

			const created = await this.#createActivity(trx, {
				id: this.generateActivityId(),
				...rest,
				type_id: typeId,
				date: rest.date.getTime().toString(),
			});

			this.#addGuests(trx, created, guestIds);
			return created;
		});

		return await this.#findOrThrow(createdActivity);
	}

	async update(
		activity: Pick<Activity, 'id' | 'date' | 'description' | 'name'>,
	) {
		const { id, date, ...rest } = activity;
		const updated = await this.db
			.updateTable('activity')
			.returning('id')
			.set({
				...rest,
				date: date.getTime().toString(),
			})
			.where('id', '=', activity.id)
			.executeTakeFirstOrThrow();
		return await this.#findOrThrow(updated.id as ActivityId);
	}

	async delete(id: ActivityId) {
		await this.db.deleteFrom('activity').where('id', '=', id).execute();
	}
}
