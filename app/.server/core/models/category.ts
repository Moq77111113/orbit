import type { Item } from './item';

export type CategoryId = string & { __type: 'CategoryId' };

export interface Category {
  id: CategoryId;
  name: string;
  description?: string;
  parent?: Category;
  children: Category[];
  items: Item[];
  createdAt: Date;
  updatedAt: Date;
}
