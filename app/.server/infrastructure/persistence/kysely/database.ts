import type { DB } from './types/db';
import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';

const dialect = new SqliteDialect({
  database: new SQLite('db.sqlite'),
});

export const db = new Kysely<DB>({
  dialect,
  plugins: [new ParseJSONResultsPlugin()],
});
