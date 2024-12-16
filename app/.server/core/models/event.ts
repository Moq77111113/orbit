import type { Category } from './category';

import type { Person } from './person';

export type EventId = string & { __type: 'EventId' };
export interface Event {
  id: EventId;
  name: string;
  type: string;
  date: Date;
  host: Person;
  description?: string;
  categories: Category[];
  guests: Person[];
  createdAt: Date;
  updatedAt: Date;
}
