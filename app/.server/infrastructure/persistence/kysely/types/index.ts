import type { CategoryTable } from './category';
import type { EventTable } from './event';
import type { EventCategoryTable } from './event_category';
import type { EventGuestTable } from './event_guest';
import type { ItemTable } from './item';
import type { ItemClaimTable } from './item_claim';
import type { PersonTable } from './person';
import type { UserTable } from './user';

export interface Database {
  user: UserTable;
  person: PersonTable;
  event: EventTable;
  eventCategory: EventCategoryTable;
  eventGuest: EventGuestTable;
  category: CategoryTable;
  item: ItemTable;
  itemClaim: ItemClaimTable;
}
