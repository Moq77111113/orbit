type RepoItem<Id extends string> = { id: Id };

type Query<Id extends string, Item extends RepoItem<Id>> = {
  find(id: Id): Promise<Item | null>;
};

type Command<Id extends string, Item extends RepoItem<Id>> = {
  create(payload: Omit<Item, 'createdAt' | 'updatedAt'>): Promise<Item>;
  update(payload: Item): Promise<Item>;
};

type Pretty<T> = {
  [K in keyof T]: T[K];
};
type Repository<
  Id extends string,
  Item extends RepoItem<Id>,
  T = Record<string, unknown>
> = Pretty<Query<Id, Item> & Command<Id, Item> & T>;
