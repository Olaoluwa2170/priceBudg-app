import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Create a new user
 */
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const userId = await ctx.db.insert('users', {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
    });

    // Create RequestCount record
    await ctx.db.insert('requestCounts', {
      userId,
      numberOfRequests: 0,
    });

    return userId;
  },
});

export const getActiveUser = query({
  handler: async (ctx) => {
    const authIdentity = await ctx.auth.getUserIdentity();

    if (authIdentity === null || !authIdentity.email) return null;

    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', authIdentity.email as string))
      .first();
  },
});

/**
 * Get a user by ID
 */
export const get = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user;
  },
});

/**
 * Get a user by email
 */
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    return user;
  },
});

/**
 * Get all users
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    return users;
  },
});

/**
 * Delete a user by ID
 */
export const remove = mutation({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);

    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
