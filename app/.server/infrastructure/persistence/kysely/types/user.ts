import type { ColumnType, Generated, Selectable } from 'kysely';

export interface UserTable {
  id: Generated<string>;
  email: string;
  createdAt: ColumnType<Date, number | undefined, never>;
  updatedAt: ColumnType<Date, number | undefined, never>;
}

export type UserDb = Selectable<UserTable>;
