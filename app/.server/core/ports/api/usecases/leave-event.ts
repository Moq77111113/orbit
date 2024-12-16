export type LeaveEvent = {
  (event: Event): Promise<void>;
};
