import type { Activity } from '~/.server/core/models/activity';

export type GenerateActivityLink = {
  (activity: Activity): Promise<string>;
};
