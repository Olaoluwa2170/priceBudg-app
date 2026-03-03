import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const list = query({
  args: {
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query('budgets')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId!))
      .collect();
  },
});

export const getById = query({
  args: {
    budgetId: v.id('budgets'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.budgetId);
  },
});

export const getItems = query({
  args: {
    budgetId: v.id('budgets'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('budgetItems')
      .withIndex('by_budgetId', (q) => q.eq('budgetId', args.budgetId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    userId: v.id('users'),
    email: v.string(),
    description: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const budgetId = await ctx.db.insert('budgets', {
      name: args.name,
      userId: args.userId,
      email: args.email,
      description: args.description,
      targetAmount: args.targetAmount,
    });
    return budgetId;
  },
});

export const addItem = mutation({
  args: {
    budgetId: v.id('budgets'),
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const itemId = await ctx.db.insert('budgetItems', {
      budgetId: args.budgetId,
      name: args.name,
      price: args.price,
      quantity: args.quantity,
      addedAt: Date.now(),
    });
    return itemId;
  },
});

export const deleteItem = mutation({
  args: {
    itemId: v.id('budgetItems'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});

export const deleteBudget = mutation({
  args: {
    budgetId: v.id('budgets'),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('budgetItems')
      .withIndex('by_budgetId', (q) => q.eq('budgetId', args.budgetId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(args.budgetId);
  },
});
