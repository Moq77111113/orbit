export type Pretty<T> = {
  [K in keyof T]: T[K];
};

export type Optional<T> = T | null | undefined;

export type Or<T, K> = T | K;

export type MaybePromise<T> = Or<T, Promise<T>>;
