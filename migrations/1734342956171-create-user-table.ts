import { sql } from 'kysely';
import { Kysely } from 'kysely';


export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('user')
    .addColumn('id', 'varchar', (col) => col.primaryKey())
    .addColumn('email', 'varchar', (col) => col.unique().notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('user').execute();
}
