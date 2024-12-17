import type { Kysely, Selectable } from 'kysely';
import type { DB } from '../types/db';
import type { UserRepository } from '~/.server/core/ports/spi/persistence/user.repository';
import type { User, UserId } from '~/.server/core/models/user';

type UserRepositoryContext = {
  db: Kysely<DB>;
};

type UserDb = Selectable<DB['user']>;
export function KyselyUserRepository(
  context: UserRepositoryContext
): UserRepository {
  const { db } = context;

  function toDomain(user: UserDb): User {
    return {
      ...user,
      id: user.id as UserId,
    };
  }
  async function find(id: UserId) {
    const user = await db
      .selectFrom('user')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return user ? toDomain(user) : null;
  }

  async function findByEmail(email: string) {
    const user = await db
      .selectFrom('user')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    return user ? toDomain(user) : null;
  }

  async function create(user: User) {
    const inserted = await db
      .insertInto('user')
      .returningAll()
      .values(user)
      .executeTakeFirstOrThrow();

    return toDomain(inserted);
  }

  async function update(user: User) {
    const { id, ...rest } = user;
    const updated = await db
      .updateTable('user')
      .returningAll()
      .set(rest)
      .where('id', '=', user.id)
      .executeTakeFirstOrThrow();

    return toDomain(updated);
  }

  return { find, findByEmail, create, update };
}

export type KyselyUserRepository = ReturnType<typeof KyselyUserRepository>;
