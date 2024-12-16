import { sql } from 'kysely';
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('item')
    .addColumn('id', 'varchar', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('profile_image', 'varchar')
    .addColumn('user_id', 'varchar', (col) =>
      col.references('user.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`current_timestamp`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('person').execute();
}
