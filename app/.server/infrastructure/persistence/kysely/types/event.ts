import type { ColumnType, Generated, Selectable } from 'kysely';

export interface EventTable {
  id: Generated<string>;
  name: string;
  type_id: string;
  date: ColumnType<Date, number | undefined>;
  host_id: string;
  description?: string;
  createdAt: ColumnType<Date, number | undefined, never>;
  updatedAt: ColumnType<Date, number | undefined, never>;
}

export type EventDb = Selectable<Event>;
