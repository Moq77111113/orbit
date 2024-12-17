import type { ActivityId } from '~/.server/core/models/activity';
import type {
  Category,
  CategoryHierarchy,
  CategoryId,
} from '~/core/models/category';

type CreateCategory = Omit<Category, 'id'>;
export interface CategoryRepository {
  find(id: CategoryId): Promise<Category | null>;
  findChildren(id: CategoryId): Promise<Category[]>;
  findHierarchy(
    id: CategoryId,
    depth?: number
  ): Promise<CategoryHierarchy | null>;
  findByActivityId(activityId: ActivityId): Promise<Category[]>;
  create(category: CreateCategory): Promise<Category>;
  update(category: Category): Promise<Category>;
}
