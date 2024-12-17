import type { InferResult, Kysely } from 'kysely';
import type { DB } from '../types/db';
import crypto from 'node:crypto';
import type { ActivityRepository } from '~/.server/core/ports/spi/persistence/activity.repository';
import type { Activity, ActivityId } from '~/.server/core/models/activity';
import type { PersonId } from '~/.server/core/models/person';
import type { r } from 'node_modules/@react-router/dev/dist/routes-DHIOx0R9';

type ActivityRepositoryContext = {
  db: Kysely<DB>;
};

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
          eb.val('')
        )
        .as('guestIds'),
    ]);

type ActivityWithGuests = InferResult<ReturnType<typeof query>>[number];


export function KyselyActivityRepository(
  context: ActivityRepositoryContext
): ActivityRepository {
  const { db } = context;

  function toDomain(activity: ActivityWithGuests): Activity {
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
  async function find(id: ActivityId) {
    const activity = await query(db)
      .where('activity.id', '=', id)
      .executeTakeFirst();
    if (!activity) return null;
    return toDomain(activity);
  }

  async function findOrThrow(id: ActivityId) {
    const activity = await find(id);
    if (!activity) {
      throw new Error(`Activity with id ${id} not found`);
    }
    return activity;
  }

  async function findByHost(hostId: PersonId) {
    const activities = await query(db)
      .where('activity.host_id', '=', hostId)
      .groupBy(['activity.id'])
      .execute();
    return activities.map(toDomain);
  }

  async function create(activity: Activity) {
    const { type, guestIds, ...rest } = activity;
    const trx = await db.transaction().execute(async (trx) => {
      const type = await trx
        .insertInto('activity_type')
        .values({
          name: activity.type,
          id: crypto.randomUUID(),
        })
        .onConflict((oc) => oc.doNothing())
        .returning('id')
        .executeTakeFirstOrThrow();

      const created = await trx
        .insertInto('activity')
        .values({
          ...rest,
          id: rest.id,
          type_id: type.id,
          date: rest.date.getTime().toString(),
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      await trx
        .insertInto('activity_guest')
        .values(
          guestIds.map((guestId) => ({
            activity_id: created.id,
            guest_id: guestId,
          }))
        )

        .execute();
      return created;
    });

    return await findOrThrow(trx.id as ActivityId);
  }

  async function update(
    activity: Pick<Activity, 'id' | 'date' | 'description' | 'name'>
  ) {
    const { id, ...rest } = activity;
    const updated = await db
      .updateTable('activity')
      .returning('id')
      .set({
        ...rest,
        date: rest.date.getTime().toString(),
      })
      .where('id', '=', activity.id)
      .executeTakeFirstOrThrow();
    return await findOrThrow(updated.id as ActivityId);
  }

  async function deleteActivity(id: ActivityId) {
    await db.deleteFrom('activity').where('id', '=', id).execute();
  }

  return {
    find,
    findByHost,
    create,
    update,
    delete: deleteActivity,
  };
}
