import type { Kysely, Selectable } from 'kysely';
import type { User, UserId } from '~/.server/core/models/user';
import type {
	CreateUser,
	UserRepository,
} from '~/.server/core/ports/spi/persistence/user.repository';
import { generateId } from '~/.server/infrastructure/generators/id.generator';
import type { DB } from '../types/db';

type UserDb = Selectable<DB['user']>;

export class KyselyUserRepository implements UserRepository {
	constructor(
		protected readonly db: Kysely<DB>,
		protected readonly generateUserId = generateId('usr'),
	) {}

	#toDomain(user: UserDb): User {
		return {
			...user,
			id: user.id as UserId,
		};
	}
	async find(id: UserId) {
		const user = await this.db
			.selectFrom('user')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirst();

		return user ? this.#toDomain(user) : null;
	}

	async findByEmail(email: string) {
		const user = await this.db
			.selectFrom('user')
			.selectAll()
			.where('email', '=', email)
			.executeTakeFirst();

		return user ? this.#toDomain(user) : null;
	}

	async create(user: CreateUser) {
		const inserted = await this.db
			.insertInto('user')
			.returningAll()
			.values({
				...user,
				id: this.generateUserId(),
			})
			.executeTakeFirstOrThrow();

		return this.#toDomain(inserted);
	}

	async update(user: User) {
		const { id, ...rest } = user;
		const updated = await this.db
			.updateTable('user')
			.returningAll()
			.set(rest)
			.where('id', '=', user.id)
			.executeTakeFirstOrThrow();

		return this.#toDomain(updated);
	}

	async delete(id: UserId) {
		await this.db.deleteFrom('user').where('id', '=', id).execute();
	}
}
