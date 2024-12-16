import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('item_claim')
    .addColumn('item_id', 'varchar', (col) => col.references('item.id'))
    .addColumn('claim_id', 'varchar', (col) => col.references('person.id'))
    .addUniqueConstraint('unique_item_claim', ['item_id', 'claim_id'])
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('item_claim').execute();
}
