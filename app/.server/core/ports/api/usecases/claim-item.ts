import type { Item } from '~/.server/core/models/item';

type ClaimItemRequest = {
  itemId: string;
};
export type ClaimItem = {
  (event: Event, request: ClaimItemRequest): Promise<Item>;
};
