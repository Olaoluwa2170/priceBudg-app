import { cronJobs } from 'convex/server';
import { api } from './_generated/api';

const crons = cronJobs();

crons.monthly(
  'Reset every users request count',
  {
    day: 1,
    hourUTC: 0,
    minuteUTC: 0,
  },
  api.requestCount.resetAllRequestCounts
);

export default crons;
