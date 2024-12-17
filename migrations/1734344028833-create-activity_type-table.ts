import { sql } from 'kysely';
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('activity_type')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('name', 'varchar', (col) => col.notNull().unique())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('activity_type').execute();
}
