import type { Event } from '~/.server/core/models/event';

type CreateEventRequest = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateEvent = {
  (event: CreateEventRequest): Promise<void>;
};
