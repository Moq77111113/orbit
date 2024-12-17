import type { Person, PersonId } from '~/core/models/person';

export interface PersonRepository {
  find(id: PersonId): Promise<Person | null>;
  create(person: Omit<Person, 'createdAt' | 'updatedAt'>): Promise<Person>;
  update(person: Person): Promise<Person>;
}
