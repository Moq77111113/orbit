import type { Event, EventId } from '~/core/models/event';
import type { PersonId } from '~/core/models/person';

type EventQuery = {
  findByHost(hostId: PersonId): Promise<Event[]>;
};

type EventCommand = {
  delete(id: EventId): Promise<void>;
};

export type EventRepository = Repository<
  EventId,
  Event,
  EventQuery & EventCommand
>;
