import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';

export const setUserPrimaryCurrency = mutation({
  args: {
    userId: v.id('users'),
    currency: v.string(),
  },
  handler: async (ctx, { userId, currency }) => {
    const user = await ctx.runQuery(api.users.getActiveUser);

    if (!user) throw new Error('Authenticated User is required');

    const userPrimaryCurrencyRecord = await ctx.db
      .query('primaryCurrency')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (userPrimaryCurrencyRecord) {
      await ctx.db.patch('primaryCurrency', userPrimaryCurrencyRecord._id, {
        primaryCurrency: currency,
      });
      return;
    }

    await ctx.db.insert('primaryCurrency', {
      userId,
      primaryCurrency: currency,
    });
  },
});

export const getUserPrimaryCurrency = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.users.getActiveUser);

    if (!user) throw new Error('Authenticated User is required');

    const userPrimaryCurrency = (await ctx.db
      .query('primaryCurrency')
      .filter((q) => q.eq(q.field('userId'), user._id as Id<'users'>))
      .first()) as any;

    return userPrimaryCurrency ? userPrimaryCurrency.primaryCurrency : null;
  },
});
