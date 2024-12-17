import type { Activity, ActivityId } from '~/.server/core/models/activity';
import type { PersonId } from '~/core/models/person';

type ActivityQuery = {
  find(id: ActivityId): Promise<Activity | null>;
  findByHost(hostId: PersonId): Promise<Activity[]>;
};

type ActivityCommand = {
  create(
    activity: Omit<Activity, 'createdAt' | 'updatedAt'>
  ): Promise<Activity>;
  update(
    activity: Omit<Activity, 'createdAt' | 'updatedAt'>
  ): Promise<Activity>;
  delete(id: ActivityId): Promise<void>;
};

export type ActivityRepository = ActivityQuery & ActivityCommand;
