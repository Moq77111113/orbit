import type { InferResult, Kysely, Selectable } from 'kysely';

import type { PersonRepository } from '~/.server/core/ports/spi/persistence/person.repository';
import type { Person, PersonId } from '~/.server/core/models/person';
import type { UserId } from '~/.server/core/models/user';
import { jsonBuildObject } from 'kysely/helpers/sqlite';
import type { DB } from '../types/db';

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

export class KyselyPersonRepository implements PersonRepository {
  constructor(protected readonly db: Kysely<DB>) {}

  #toDomain(person: PersonWithUser): Person {
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

  async find(id: PersonId) {
    const person = await query(this.db)
      .where('person.id', '=', id)
      .executeTakeFirst();
    if (!person) return null;
    return this.#toDomain(person);
  }

  async #findOrThrow(id: PersonId) {
    const person = await this.find(id);
    if (!person) throw new Error(`Person with id ${id} not found`);
    return person;
  }

  async create(person: Person) {
    const inserted = await this.db
      .insertInto('person')
      .values({
        ...person,
        user_id: person.user?.id,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    return await this.#findOrThrow(inserted.id as PersonId);
  }

  async update(person: Person) {
    const { id, user, ...rest } = person;
    const updated = await this.db
      .updateTable('person')
      .returning('id')
      .set({
        ...rest,
        user_id: user?.id,
      })
      .where('id', '=', person.id)
      .executeTakeFirstOrThrow();

    return await this.#findOrThrow(updated.id as PersonId);
  }
}
