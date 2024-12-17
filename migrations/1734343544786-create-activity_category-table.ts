import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('activity_category')
    .addColumn('activity_id', 'varchar', (col) => col.references('activity.id'))
    .addColumn('category_id', 'varchar', (col) => col.references('category.id'))
    .addUniqueConstraint('unique_activity_category', [
      'activity_id',
      'category_id',
    ])
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('activity_category').execute();
}
