import type { ActivityId } from '~/.server/core/models/activity';
import type {
  Category,
  CategoryHierarchy,
  CategoryId,
} from '~/core/models/category';

type CategoryQuery = {
  find(id: CategoryId): Promise<Category | null>;
  findChildren(id: CategoryId): Promise<Category[]>;
  findHierarchy(
    id: CategoryId,
    depth?: number
  ): Promise<CategoryHierarchy | null>;
  findByActivityId(activityId: ActivityId): Promise<Category[]>;
};

type CategoryCommand = {
  create(category: Category): Promise<Category>;
  update(category: Category): Promise<Category>;
};

export type CategoryRepository = CategoryQuery & CategoryCommand;
