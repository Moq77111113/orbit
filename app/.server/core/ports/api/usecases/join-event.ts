import type { Person } from '~/.server/core/models/person';

type JoinEventRequest = {
  pêrson: Person;
  verificationCode: string;
};
export type JoinEvent = {
  (event: Event, request: JoinEventRequest): Promise<void>;
};
