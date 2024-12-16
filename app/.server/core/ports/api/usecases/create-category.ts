import type { Category } from '~/.server/core/models/category';
import type { Event } from '~/.server/core/models/event';

type CreateCategoryRequest = Omit<
  Category,
  'id' | 'createdAt' | 'updatedAt' | 'children' | 'items'
>;

export type AddCategory = {
  (event: Event, request: CreateCategoryRequest): Promise<Category>;
};
