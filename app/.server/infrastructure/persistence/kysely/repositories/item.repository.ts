import { sql, type InferResult, type Kysely } from 'kysely';
import type { DB } from '../types/db';

import type {
  ItemCreate,
  ItemRepository,
} from '~/.server/core/ports/spi/persistence/item.repository';

import type { Item, ItemId } from '~/.server/core/models/item';
import type { Person, PersonId } from '~/.server/core/models/person';
import type { Category, CategoryId } from '~/.server/core/models/category';

const query = (db: Kysely<DB>) =>
  db
    .selectFrom('item')
    .innerJoin('item_claim', 'item.id', 'item_claim.item_id')
    .groupBy([
      'item.id',
      'item.name',
      'item.quantity',
      'item.note',
      'item.category_id',
    ])
    .select((eb) => [
      'item.id',
      'item.name',
      'item.quantity',
      'item.note',
      'item.category_id',
      eb.fn
        .coalesce(
          eb.fn<string>('group_concat', ['item_claim.claim_id']),
          eb.val('')
        )
        .as('claims'),
    ]);

type ItemWithClaims = InferResult<ReturnType<typeof query>>[number];

export class KyselyItemRepository implements ItemRepository {
  constructor(protected readonly db: Kysely<DB>) {}

  #toDomain(item: ItemWithClaims): Item {
    const { id, claims, category_id, ...rest } = item;
    const claimIds = claims.split(',').filter(Boolean); // TODO: parse using zod or similar
    return {
      id: id as ItemId,
      ...rest,
      quantity: item.quantity,
      claimedByIds: claimIds.map((claim) => claim as PersonId),
      categoryId: category_id as CategoryId,
      priority: null,
      notes: null,
    };
  }

  async find(id: ItemId) {
    const item = await query(this.db)
      .where('item.id', '=', id)
      .executeTakeFirst();
    if (!item) return null;

    return this.#toDomain(item);
  }

  async #findOrThrow(id: ItemId) {
    const item = await this.find(id);
    if (!item) throw new Error('Item not found');
    return item;
  }
  async create(item: ItemCreate) {
    const { id } = await this.db
      .insertInto('item')
      .values(item)
      .returning('id')
      .executeTakeFirstOrThrow();

    return await this.#findOrThrow(id as ItemId);
  }

  async update(item: Item) {
    const { id } = await this.db
      .updateTable('item')
      .returning('id')
      .set(item)
      .where('id', '=', item.id)
      .executeTakeFirstOrThrow();
    return await this.#findOrThrow(id as ItemId);
  }

  async claim(itemId: ItemId, person: Person) {
    const res = await this.db
      .insertInto('item_claim')
      .values({ item_id: itemId, claim_id: person.id })
      .returning('item_id')
      .executeTakeFirst();

    if (!res?.item_id) throw new Error('Claim failed');

    return await this.#findOrThrow(res.item_id as ItemId);
  }

  async unclaim(itemId: ItemId, person: Person) {
    const res = await this.db
      .deleteFrom('item_claim')
      .where('item_id', '=', itemId)
      .where('claim_id', '=', person.id)
      .executeTakeFirst();

    if (!res) throw new Error('Unclaim failed');

    return await this.#findOrThrow(itemId);
  }

  async findWithDetails(id: ItemId) {
    const result = await this.db
      .selectFrom('item')
      .innerJoin('item_claim', 'item.id', 'item_claim.item_id')
      .innerJoin('person', 'item_claim.claim_id', 'person.id')
      .leftJoin('user', 'person.user_id', 'user.id')
      .innerJoin('category', 'item.category_id', 'category.id')
      .select((eb) => [
        'item.id',
        'item.name',
        'item.quantity',
        'item.note',
        'item.category_id',
        'category.id as category_id',
        'category.name as category_name',
        'category.description as category_description',
        'category.parent_id as category_parent_id',
        eb.fn
          .coalesce(
            eb.fn<string>('group_concat', ['item_claim.claim_id']),
            eb.val('')
          )
          .as('claimedByIds'),
        sql<string>`
            COALESCE(
              json_group_array(
                json_object(
                  'id', person.id,
                  'name', person.name,
                  'personImage', person.profile_image,
                  'user', json_object(
                    'id', user.id,
                    'email', user.email
                  )
                )
              ),
              '[]'
            )
          `.as('claims'),
      ])
      .where('item.id', '=', id)
      .groupBy('item.id')

      .executeTakeFirst();

    if (!result) return null;
    const {
      category_description,
      category_id,
      category_name,
      category_parent_id,
      claims,
      claimedByIds,
      ...rest
    } = result;

    const item = {
      ...rest,
      id: rest.id as ItemId,
      categoryId: category_id as CategoryId,
      quantity: rest.quantity ?? undefined,
      claimedByIds: claimedByIds.split(',').filter(Boolean) as PersonId[],
      priority: null,
      notes: null,
    } satisfies Item;

    const claimedBy = JSON.parse(claims) as Person[];
    const category = {
      id: category_id as CategoryId,
      name: category_name,
      description: category_description ?? undefined,
      parentId: (category_parent_id as CategoryId) ?? undefined,
    } satisfies Category;

    return {
      item,
      claimedBy,
      category,
    };
  }
}
