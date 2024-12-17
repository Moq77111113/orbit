import { sql } from 'kysely';
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('activity')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('type_id', 'varchar', (col) =>
      col.references('activity_type.id').onDelete('set null')
    )
    .addColumn('host_id', 'varchar', (col) =>
      col.references('person.id').onDelete('cascade')
    )
    .addColumn('date', 'timestamp', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('activity').execute();
}
