import { Id } from 'convex/_generated/dataModel';
import { Plan } from 'types';

export const FREE_PLAN: Plan = {
  _id: '' as Id<'plans'>,
  _creationTime: '',
  planTitle: 'Free',
  slug: 'free',
  price: 0,
  requestAllocations: 20,
};
