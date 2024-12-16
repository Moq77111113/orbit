import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('category_item')
    .addColumn('category_id', 'varchar', (col) => col.references('category.id'))
    .addColumn('item_id', 'varchar', (col) => col.references('item.id'))
    .addUniqueConstraint('unique_category_item', ['category_id', 'item_id'])
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('category_item').execute();
}
