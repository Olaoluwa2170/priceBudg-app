import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get active subscription for current user
 */
export const getActiveSubscription = query({
  handler: async (ctx) => {
    const authIdentity = await ctx.auth.getUserIdentity();

    if (authIdentity === null || !authIdentity.email) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', authIdentity.email as string))
      .first();

    if (!user) return null;

    const subscription = await ctx.db
      .query('subscription')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    // Check if subscription is still valid (not expired)
    if (subscription && subscription.expiresAt > Date.now()) {
      // Get plan details
      const plan = await ctx.db.get(subscription.planId);
      return {
        ...subscription,
        plan,
      };
    }

    return null;
  },
});

/**
 * Create or update subscription after payment
 */
export const createSubscription = mutation({
  args: {
    referenceId: v.string(),
    planId: v.id('plans'),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const authIdentity = await ctx.auth.getUserIdentity();

    if (authIdentity === null || !authIdentity.email) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', authIdentity.email as string))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has a subscription
    const existingSubscription = await ctx.db
      .query('subscription')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, {
        referenceId: args.referenceId,
        planId: args.planId,
        expiresAt: args.expiresAt,
      });
      return existingSubscription._id;
    } else {
      // Create new subscription
      const subscriptionId = await ctx.db.insert('subscription', {
        referenceId: args.referenceId,
        planId: args.planId,
        userId: user._id,
        expiresAt: args.expiresAt,
      });
      return subscriptionId;
    }
  },
});

/**
 * Get all plans
 */
export const getPlans = query({
  handler: async (ctx) => {
    const plans = await ctx.db.query('plans').collect();
    return plans;
  },
});
