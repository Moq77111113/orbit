import type { Kysely } from 'kysely';
import type { Database } from '../types';
import type { PersonRepository } from '~/.server/core/ports/spi/persistence/person.repository';
import type { PersonDb } from '../types/person';
import type { Person, PersonId } from '~/.server/core/models/person';
import type { KyselyUserRepository } from './user.repository';
import type { User, UserId } from '~/.server/core/models/user';
import { jsonBuildObject } from 'kysely/helpers/sqlite';

type PersonRepositoryContext = {
  db: Kysely<Database>;
  userRepo: KyselyUserRepository;
};

export function KyselyPersonRepository(
  context: PersonRepositoryContext
): PersonRepository {
  const { db, userRepo } = context;

  const query = db
    .selectFrom('person')
    .leftJoin('user', 'person.user_id', 'user.id')
    .select((eb) => [
      'person.id',
      'person.name',
      'person.profile_image',
      jsonBuildObject({
        id: eb.ref('user.id'),
        email: eb.ref('user.email'),
      }).as('user'),
    ]);
  function toDomain(
    person: Awaited<ReturnType<(typeof query)['execute']>>[number]
  ): Person {
    const { id, profile_image, user, name } = person;
    return {
      name,
      profileImage: profile_image ?? undefined,
      id: id as PersonId,
      user:
        user?.id && user?.email
          ? {
              id: user.id as UserId,
              email: user.email,
            }
          : undefined,
    };
  }

  async function find(id: PersonId) {
    const person = await query.where('person.id', '=', id).executeTakeFirst();
    if (!person) return null;
    return toDomain(person);
  }

  async function findOrThrow(id: PersonId) {
    const person = await find(id);
    if (!person) throw new Error(`Person with id ${id} not found`);
    return person;
  }

  async function create(person: Person) {
    const inserted = await db
      .insertInto('person')
      .values({
        ...person,
        user_id: person.user?.id,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    return await findOrThrow(inserted.id as PersonId);
  }

  async function update(person: Person) {
    const { id, user, ...rest } = person;
    const updated = await db
      .updateTable('person')
      .returning('id')
      .set({
        ...rest,
        user_id: user?.id,
      })
      .where('id', '=', person.id)
      .executeTakeFirstOrThrow();

    return await findOrThrow(updated.id as PersonId);
  }

  return {
    find,
    create,
    update,
  };
}

export type KyselyPersonRepository = ReturnType<typeof KyselyPersonRepository>;
