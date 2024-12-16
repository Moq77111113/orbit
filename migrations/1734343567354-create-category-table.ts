import { sql } from 'kysely';
import { Kysely } from 'kysely';
export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('category')
    .addColumn('id', 'varchar', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('parent_id', 'varchar', (col) => col.references('category.id'))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('category').execute();
}
