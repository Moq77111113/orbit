import type { Activity } from '~/.server/core/models/activity';
import type { Person } from '~/.server/core/models/person';

type JoinActivityRequest = {
  pêrson: Person;
  verificationCode: string;
};
export type JoinActivity = {
  (activity: Activity, request: JoinActivityRequest): Promise<void>;
};
