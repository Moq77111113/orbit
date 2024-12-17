import type { Optional } from '../types/utils';
import type { Category, CategoryId } from './category';
import type { Person, PersonId } from './person';

export type ItemId = string & { __type: 'ItemId' };

export interface Item {
  id: ItemId;
  name: string;
  quantity: Optional<number>;
  claimedByIds: PersonId[];
  categoryId: CategoryId;
  priority: Optional<number>;
  notes: Optional<string>;
}

export interface DetailledItem {
  item: Item;
  claimedBy: Person[];
  category: Category;
}
