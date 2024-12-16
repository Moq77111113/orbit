import type { User } from './user';

export type PersonId = string & { __type: 'PersonId' };

export interface Person {
  id: PersonId;
  name: string;
  profileImage?: string;
  user?: User;
}
