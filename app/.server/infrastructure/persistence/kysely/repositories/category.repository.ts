import type { InferResult, Kysely } from 'kysely';
import type { DB } from '../types/db';
import type {
  Category,
  CategoryHierarchy,
  CategoryId,
} from '~/.server/core/models/category';
import type { CategoryRepository } from '~/.server/core/ports/spi/persistence/category.repository';
import type { ActivityId } from '~/.server/core/models/activity';

type CategoryRepositoryContext = {
  db: Kysely<DB>;
};

const query = (db: Kysely<DB>) =>
  db
    .selectFrom('category')
    .select([
      'category.id',
      'category.name',
      'category.description',
      'category.parent_id',
    ]);

type CategoryWithParent = InferResult<ReturnType<typeof query>>[number];

export function KyselyCategoryRepository(
  context: CategoryRepositoryContext
): CategoryRepository {
  const { db } = context;

  function toDomain(category: CategoryWithParent): Category {
    const { id, name, description, parent_id } = category;

    return {
      id: id as CategoryId,
      name,
      description,
      parentId: parent_id as CategoryId | null,
    };
  }

  async function find(id: CategoryId) {
    const category = await query(db)
      .where('category.id', '=', id)
      .executeTakeFirst();
    if (!category) return null;
    return toDomain(category);
  }

  async function findChildren(id: CategoryId) {
    const children = await query(db)
      .where('category.parent_id', '=', id)
      .execute();
    return children.map(toDomain);
  }

  async function findChildrenRecursive(
    parentId: CategoryId,
    remainingDepth: number
  ): Promise<(Category & { children: Category[] })[]> {
    if (remainingDepth <= 0) return [];

    const directChildren = await findChildren(parentId);

    const childrenWithGrandChildren = await Promise.all(
      directChildren.map(async (child) => ({
        ...child,
        children: await findChildrenRecursive(child.id, remainingDepth - 1),
      }))
    );

    return childrenWithGrandChildren;
  }

  async function findHierarchy(
    id: CategoryId,
    depth = 2
  ): Promise<CategoryHierarchy | null> {
    const category = await find(id);
    if (!category) return null;

    const children = await findChildrenRecursive(id, depth);

    return {
      category,
      children,
      depth,
    };
  }

  async function findByActivityId(activityId: ActivityId) {
    const categories = await db
      .selectFrom('activity_category')
      .innerJoin('category', 'category.id', 'activity_category.category_id')
      .where('activity_category.activity_id', '=', activityId)
      .select([
        'category.id',
        'category.name',
        'category.description',
        'category.parent_id',
      ])
      .execute();

    return categories.map(toDomain);
  }

  async function create(category: Category) {
    const inserted = await db
      .insertInto('category')
      .returningAll()
      .values(category)
      .executeTakeFirstOrThrow();

    return toDomain(inserted);
  }

  async function update(category: Category) {
    const { id, ...rest } = category;
    const updated = await db
      .updateTable('category')
      .returningAll()
      .set(rest)
      .where('id', '=', category.id)
      .executeTakeFirstOrThrow();

    return toDomain(updated);
  }

  return {
    find,
    findChildren,
    findHierarchy,
    findByActivityId,
    create,
    update,
  };
}
