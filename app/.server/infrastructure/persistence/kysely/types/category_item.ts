import type { Selectable } from 'kysely';

export interface CategoryItemTable {
  category_id: string;
  item_id: string;
}

export type EventCategoryDb = Selectable<CategoryItemTable>;
