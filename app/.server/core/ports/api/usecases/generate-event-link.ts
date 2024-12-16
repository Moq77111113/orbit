import type { Event } from '~/.server/core/models/event';

export type GenerateEventLink = {
  (event: Event): Promise<string>;
};
