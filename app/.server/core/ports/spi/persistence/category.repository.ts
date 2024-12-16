import type { Category, CategoryId } from '~/core/models/category';
import type { Item } from '~/core/models/item';

type CategoryCommand = {
  addItem(id: CategoryId, item: Item): Promise<Category>;
  addChild(id: CategoryId, child: Category): Promise<Category>;
};

export type CategoryRepository = Repository<
  CategoryId,
  Category,
  CategoryCommand
>;
