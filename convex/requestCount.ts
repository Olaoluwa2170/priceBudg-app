import { api } from './_generated/api';
import { mutation, query } from './_generated/server';

const MAX_REQUEST_COUNT_PER_MONTH_ON_FREE_PLAN = 20;

export const resetAllRequestCounts = mutation({
  args: {},
  handler: async (ctx) => {
    const allRequestCounts = await ctx.db.query('requestCounts').collect();

    await Promise.all(
      allRequestCounts.map(async (item) => {
        await ctx.db.patch('requestCounts', item._id, {
          numberOfRequests: 0,
        });
      })
    );
  },
});

export const getUserRequestCount = query({
  handler: async (ctx) => {
    const authIdentity = await ctx.auth.getUserIdentity();

    if (!authIdentity || authIdentity.email === undefined) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', authIdentity.email as string))
      .first();

    if (!user) return null;

    const requestCountRecord = await ctx.db
      .query('requestCounts')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    return requestCountRecord?.numberOfRequests ?? 0;
  },
});

export const increaseRequestCountForUser = mutation({
  args: {},
  handler: async (ctx) => {
    const authIdentity = await ctx.auth.getUserIdentity();

    if (!authIdentity || authIdentity.email === undefined) throw new Error('Identity is required');

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', authIdentity.email as string))
      .first();

    if (!user) throw new Error('User not found');

    const activeSubscription = ctx.runQuery(api.subscriptions.getActiveSubscription);

    const requestCountRecord = await ctx.db
      .query('requestCounts')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (requestCountRecord) {
      if (
        !activeSubscription &&
        requestCountRecord.numberOfRequests === MAX_REQUEST_COUNT_PER_MONTH_ON_FREE_PLAN
      )
        return;

      const newCount = requestCountRecord.numberOfRequests + 1;
      await ctx.db.patch('requestCounts', requestCountRecord._id, {
        numberOfRequests: newCount,
      });
    } else {
      await ctx.db.insert('requestCounts', {
        numberOfRequests: 1,
        userId: user._id,
      });
    }
  },
});
