import type { Person, PersonId } from '~/core/models/person';

export type CreatePerson = Omit<Person, 'id'>;
export interface PersonRepository {
	find(id: PersonId): Promise<Person | null>;
	create(person: CreatePerson): Promise<Person>;
	update(person: Person): Promise<Person>;
}
