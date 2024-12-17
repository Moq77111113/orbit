import type { Activity } from '~/.server/core/models/activity';

export type LeaveActivity = (activity: Activity) => Promise<void>;
