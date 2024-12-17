import type { Person, PersonId } from '~/core/models/person';

type PersonQuery = {
  find(id: PersonId): Promise<Person | null>;
};

type PersonCommand = {
  create(person: Omit<Person, 'createdAt' | 'updatedAt'>): Promise<Person>;
  update(person: Person): Promise<Person>;
};

export type PersonRepository = PersonQuery & PersonCommand;
