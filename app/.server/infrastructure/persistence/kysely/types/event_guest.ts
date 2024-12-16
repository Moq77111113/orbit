import type { Selectable } from 'kysely';

export interface EventGuestTable {
  event_id: string;
  person_id: string;
  role: 'host' | 'guest';
}

export type EventGuestDb = Selectable<EventGuestTable>;
