import type { Person } from './person';

export type ItemId = string & { __type: 'ItemId' };

export interface Item {
  id: ItemId;
  name: string;
  quantity?: number;
  claimedBy: Person[];
  priority?: number;
  notes?: string;
}
