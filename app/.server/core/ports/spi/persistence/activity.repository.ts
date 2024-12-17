import type { Activity, ActivityId } from '~/.server/core/models/activity';
import type { PersonId } from '~/core/models/person';

type ActivityQuery = {
  find(id: ActivityId): Promise<Activity | null>;
  findByHost(hostId: PersonId): Promise<Activity[]>;
};

type ActivityCommand = {
  create(activity: Activity): Promise<Activity>;
  update(
    activity: Pick<Activity, 'id' | 'date' | 'description' | 'name'>
  ): Promise<Activity>;
  delete(id: ActivityId): Promise<void>;
};

export type ActivityRepository = ActivityQuery & ActivityCommand;
