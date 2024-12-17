import type { Activity } from '~/.server/core/models/activity';

type CreateActivityRequest = Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateActivity = {
  (activity: CreateActivityRequest): Promise<void>;
};
