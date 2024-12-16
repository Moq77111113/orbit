import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('event_category')
    .addColumn('event_id', 'varchar', (col) => col.references('event.id'))
    .addColumn('category_id', 'varchar', (col) => col.references('category.id'))
    .addUniqueConstraint('unique_event_category', ['event_id', 'category_id'])
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('event_category').execute();
}
