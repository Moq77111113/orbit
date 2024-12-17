import type { Activity, ActivityId } from '~/.server/core/models/activity';
import type { PersonId } from '~/core/models/person';

export type CreateActivity = Omit<Activity, 'id'>;

export interface ActivityRepository {
  find(id: ActivityId): Promise<Activity | null>;
  findByHost(hostId: PersonId): Promise<Activity[]>;
  create(activity: CreateActivity): Promise<Activity>;
  update(
    activity: Pick<Activity, 'id' | 'date' | 'description' | 'name'>
  ): Promise<Activity>;
  delete(id: ActivityId): Promise<void>;
}
