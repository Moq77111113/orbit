import { typeid } from 'typeid-js';

export function generateId<T extends string>(prefix: T) {
  return () => typeid(prefix).toString() as `${T}_${string}`;
}
