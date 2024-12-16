import type { ColumnType, Generated, Selectable } from 'kysely';

export interface ItemTable {
  id: Generated<string>;
  name: string;
  quantity: number | null;
  note: string | null;
  createdAt: ColumnType<Date, number | undefined, never>;
  updatedAt: ColumnType<Date, number | undefined, never>;
}

export type ItemDb = Selectable<ItemTable>;
