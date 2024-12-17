import type { User, UserId } from '~/core/models/user';

export interface UserRepository {
  find(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: UserId): Promise<void>;
}
