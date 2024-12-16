import type { Person, PersonId } from '~/core/models/person';

export type PersonRepository = Repository<PersonId, Person>;
