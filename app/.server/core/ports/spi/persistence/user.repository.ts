import type { User, UserId } from '~/core/models/user';

type UserQuery = {
  findByEmail(email: string): Promise<User | null>;
};

export type UserRepository = Repository<UserId, User, UserQuery>;
