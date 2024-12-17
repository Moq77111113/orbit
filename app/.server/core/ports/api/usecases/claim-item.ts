import type { Activity } from '~/.server/core/models/activity';
import type { Item } from '~/.server/core/models/item';

type ClaimItemRequest = {
  itemId: string;
};
export type ClaimItem = {
  (activity: Activity, request: ClaimItemRequest): Promise<Item>;
};
