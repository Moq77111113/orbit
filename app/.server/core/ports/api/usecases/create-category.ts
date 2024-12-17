import type { Category } from '~/.server/core/models/category';
import type { Activity } from '~/.server/core/models/activity';

type CreateCategoryRequest = Omit<
  Category,
  'id' | 'createdAt' | 'updatedAt' | 'children' | 'items'
>;

export type AddCategory = {
  (activity: Activity, request: CreateCategoryRequest): Promise<Category>;
};
