import type { Selectable } from 'kysely';

export interface ItemClaimTable {
  item_id: string;
  claim_id: string;
}

export type ItemClaimDb = Selectable<ItemClaimTable>;
