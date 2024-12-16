import type { Item, ItemId } from '~/core/models/item';
import type { Person } from '~/core/models/person';

type ItemQuery = {
  find(id: ItemId): Promise<Item | null>;
};

type ItemCreate = Omit<Item, 'claimedBy'>;
type ItemCommand = {
  create(oayload: ItemCreate): Promise<Item>;
  update(payload: ItemCreate): Promise<Item>;
  claim(itemId: ItemId, person: Person): Promise<Item>;
};

export type ItemRepository = ItemQuery & ItemCommand;
