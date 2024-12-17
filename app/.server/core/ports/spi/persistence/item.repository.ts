import type { DetailledItem, Item, ItemId } from '~/core/models/item';
import type { Person } from '~/core/models/person';

type ItemQuery = {
  find(id: ItemId): Promise<Item | null>;
  findWithDetails(id: ItemId): Promise<DetailledItem | null>;
};

type ItemCreate = Omit<Item, 'claimedByIds'>;

type ItemCommand = {
  create(oayload: ItemCreate): Promise<Item>;
  update(payload: ItemCreate): Promise<Item>;
  delete?(id: ItemId): Promise<void>;
  claim(itemId: ItemId, person: Person): Promise<Item>;
  unclaim(itemId: ItemId, person: Person): Promise<Item>;
};

export type ItemRepository = ItemQuery & ItemCommand;
