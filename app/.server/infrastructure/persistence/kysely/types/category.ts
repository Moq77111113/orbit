import type { ColumnType, Generated, Selectable } from 'kysely';

export interface CategoryTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: ColumnType<Date, number | undefined, never>;
  updatedAt: ColumnType<Date, number | undefined, never>;
}

export type CategoryDb = Selectable<CategoryTable>;
