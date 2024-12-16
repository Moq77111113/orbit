import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('event_guest')
    .addColumn('event_id', 'varchar', (col) => col.references('event.id'))
    .addColumn('guest_id', 'varchar', (col) => col.references('person.id'))
    .addUniqueConstraint('unique_event_guest', ['event_id', 'guest_id'])
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('event_guest').execute();
}
