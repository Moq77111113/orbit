import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('activity_guest')
    .addColumn('activity_id', 'varchar', (col) => col.references('activity.id'))
    .addColumn('guest_id', 'varchar', (col) => col.references('person.id'))
    .addUniqueConstraint('unique_activity_guest', ['activity_id', 'guest_id'])
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('activity_guest').execute();
}
