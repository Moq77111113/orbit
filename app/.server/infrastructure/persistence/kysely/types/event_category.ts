import type { Selectable } from 'kysely';

export interface EventCategoryTable {
  event_id: string;
  category_id: string;
}

export type EventCategoryDb = Selectable<EventCategoryTable>;
