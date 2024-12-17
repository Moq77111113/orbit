import type { InferResult, Kysely, Selectable } from 'kysely';

import type { PersonRepository } from '~/.server/core/ports/spi/persistence/person.repository';
import type { Person, PersonId } from '~/.server/core/models/person';
import type { UserId } from '~/.server/core/models/user';
import { jsonBuildObject } from 'kysely/helpers/sqlite';
import type { DB } from '../types/db';
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

type PersonRepositoryContext = {
  db: Kysely<DB>;
};

const query = (db: Kysely<DB>) =>
  db
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

type PersonWithUser = InferResult<ReturnType<typeof query>>[number];
export function KyselyPersonRepository(
  context: PersonRepositoryContext
): PersonRepository {
  const { db } = context;

  function toDomain(person: PersonWithUser): Person {
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
    const person = await query(db).where('person.id', '=', id).executeTakeFirst();
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
