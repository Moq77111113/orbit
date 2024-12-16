import type { Kysely } from 'kysely';
import type { Database } from '../types';

import type { ItemRepository } from '~/.server/core/ports/spi/persistence/item.repository';

import type { Item, ItemId } from '~/.server/core/models/item';
import type { KyselyPersonRepository } from './person.repository';
import type { Person, PersonId } from '~/.server/core/models/person';
import { jsonBuildObject } from 'kysely/helpers/sqlite';
import type { UserId } from '~/.server/core/models/user';

type ItemRepositoryContext = {
  db: Kysely<Database>;
  personRepo: KyselyPersonRepository;
};

export function KyselyItemRepository(
  context: ItemRepositoryContext
): ItemRepository {
  const { db } = context;

  const query = db
    .selectFrom('item')
    .innerJoin('itemClaim', 'item.id', 'itemClaim.item_id')
    .innerJoin('person', 'itemClaim.claim_id', 'person.id')
    .leftJoin('user', 'person.user_id', 'user.id')
    .groupBy(['item.id', 'item.name', 'item.quantity', 'item.note'])
    .select((eb) => [
      'item.id',
      'item.name',
      'item.quantity',
      'item.note',
      eb.fn
        .coalesce(
          eb.fn
            .jsonAgg(
              jsonBuildObject({
                personId: eb.ref('person.id'),
                personName: eb.ref('person.name'),
                personImage: eb.ref('person.profile_image'),
                user: jsonBuildObject({
                  id: eb.ref('user.id'),
                  email: eb.ref('user.email'),
                }),
              })
            )
            .filterWhere('person.id', '!=', null),
          eb.val([])
        )
        .as('claims'),
    ]);

  function toDomain(
    item: Awaited<ReturnType<(typeof query)['execute']>>[number]
  ): Item {
    const { id, claims, ...rest } = item;

    return {
      id: id as ItemId,
      ...rest,
      quantity: item.quantity ?? undefined,
      claimedBy: claims.map((claim) => ({
        id: claim.personId as PersonId,
        name: claim.personName,
        profileImage: claim.personImage ?? undefined,
        user:
          claim.user?.id && claim.user?.email
            ? {
                id: claim.user.id as UserId,
                email: claim.user.email,
              }
            : undefined,
      })),
    };
  }

  async function find(id: ItemId) {
    const item = await query.where('item.id', '=', id).executeTakeFirst();

    if (!item) return null;

    return toDomain(item);
  }

  async function findOrThrow(id: ItemId) {
    const item = await find(id);
    if (!item) throw new Error('Item not found');
    return item;
  }
  async function create(item: Omit<Item, 'claimedBy'>) {
    const { id } = await db
      .insertInto('item')
      .values(item)
      .returning('id')
      .executeTakeFirstOrThrow();

    return await findOrThrow(id as ItemId);
  }

  async function update(item: Item) {
    const { id } = await db
      .updateTable('item')
      .returning('id')
      .set(item)
      .where('id', '=', item.id)
      .executeTakeFirstOrThrow();
    return await findOrThrow(id as ItemId);
  }

  async function claim(itemId: ItemId, person: Person) {
    const res = await db
      .insertInto('itemClaim')
      .values({ item_id: itemId, claim_id: person.id })
      .returning('item_id')
      .executeTakeFirst();

    if (!res?.item_id) throw new Error('Claim failed');

    return await findOrThrow(res.item_id as ItemId);
  }

  return {
    find,
    create,
    update,
    claim,
  };
}
