import type { Optional } from '../types/utils';

import type { Person, PersonId } from './person';

export type ActivityId = string & { __type: 'ActivityId' };
export interface Activity {
	id: ActivityId;
	name: string;
	type: string;
	date: Date;
	host_id: PersonId;
	description: Optional<string>;
	guestIds: PersonId[];
}

export interface DetailledActivity {
	activity: Activity;
	host: Person;
	guests: Person[];
}
