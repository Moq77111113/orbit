import type { InferResult, Kysely } from 'kysely';
import type { ActivityId } from '~/.server/core/models/activity';
import type {
  Category,
  CategoryHierarchy,
  CategoryId,
} from '~/.server/core/models/category';
import type {
  CategoryRepository,
  CreateCategory,
} from '~/.server/core/ports/spi/persistence/category.repository';
import type { DB } from '../types/db';
import { generateId } from '~/.server/infrastructure/generators/id.generator';
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

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

export class KyselyCategoryRepository implements CategoryRepository {
  constructor(
    protected readonly db: Kysely<DB>,
    protected readonly generateCategoryId = generateId('cat')
  ) {}

  #toDomain(category: CategoryWithParent): Category {
    const { id, name, description, parent_id } = category;

    return {
      id: id as CategoryId,
      name,
      description,
      parentId: parent_id as CategoryId | null,
    };
  }

  async find(id: CategoryId) {
    const category = await query(this.db)
      .where('category.id', '=', id)
      .executeTakeFirst();
    if (!category) return null;
    return this.#toDomain(category);
  }

  async findChildren(id: CategoryId) {
    const children = await query(this.db)
      .where('category.parent_id', '=', id)
      .execute();
    return children.map(this.#toDomain.bind(this));
  }

  async #findChildrenRecursive(
    parentId: CategoryId,
    remainingDepth: number
  ): Promise<(Category & { children: Category[] })[]> {
    if (remainingDepth <= 0) return [];

    const directChildren = await this.findChildren(parentId);

    const childrenWithGrandChildren = await Promise.all(
      directChildren.map(async (child) => ({
        ...child,
        children: await this.#findChildrenRecursive(
          child.id,
          remainingDepth - 1
        ),
      }))
    );

    return childrenWithGrandChildren;
  }

  async findHierarchy(
    id: CategoryId,
    depth = 2
  ): Promise<CategoryHierarchy | null> {
    const category = await this.find(id);
    if (!category) return null;

    const children = await this.#findChildrenRecursive(id, depth);

    return {
      category,
      children,
      depth,
    };
  }

  async findByActivityId(activityId: ActivityId) {
    const categories = await this.db
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

    return categories.map(this.#toDomain.bind(this));
  }

  async create(category: CreateCategory) {
    const inserted = await this.db
      .insertInto('category')
      .returningAll()
      .values({
        ...category,
        id: this.generateCategoryId(),
      })
      .executeTakeFirstOrThrow();

    return this.#toDomain(inserted);
  }

  async update(category: Category) {
    const { id, ...rest } = category;
    const updated = await this.db
      .updateTable('category')
      .returningAll()
      .set(rest)
      .where('id', '=', category.id)
      .executeTakeFirstOrThrow();

    return this.#toDomain(updated);
  }
}
