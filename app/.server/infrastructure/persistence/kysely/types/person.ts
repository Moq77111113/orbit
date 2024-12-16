import type { ColumnType, Generated, Selectable } from 'kysely';

export interface PersonTable {
  id: Generated<string>;
  name: string;
  profile_image: string | null;
  user_id: string | null;
  createdAt: ColumnType<Date, number | undefined, never>;
  updatedAt: ColumnType<Date, number | undefined, never>;
}

export type PersonDb = Selectable<PersonTable>;
