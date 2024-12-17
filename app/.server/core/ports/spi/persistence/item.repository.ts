import type { DetailledItem, Item, ItemId } from '~/core/models/item';
import type { Person } from '~/core/models/person';

export type ItemCreate = Omit<Item, 'claimedByIds'>;

export interface ItemRepository {
  find(id: ItemId): Promise<Item | null>;
  findWithDetails(id: ItemId): Promise<DetailledItem | null>;
  create(item: ItemCreate): Promise<Item>;
  update(item: Item): Promise<Item>;
  claim(itemId: ItemId, person: Person): Promise<Item>;
  unclaim(itemId: ItemId, person: Person): Promise<Item>;
}
