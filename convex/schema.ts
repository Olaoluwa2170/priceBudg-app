import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const users = defineTable({
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
}).index('by_email', ['email']);

const primaryCurrency = defineTable({
  primaryCurrency: v.string(),
  userId: v.id('users'),
}).index('by_userId', ['userId']);

const requestCounts = defineTable({
  numberOfRequests: v.number(),
  userId: v.id('users'),
}).index('by_userId', ['userId']);

const plans = defineTable({
  planTitle: v.string(),
  slug: v.string(),
  priceInNaria: v.number(), // Amount in naira
  paystackPlanCode: v.string(),
  requestAllocations: v.union(v.literal(20), v.literal(10_000)),
});

const subscription = defineTable({
  referenceId: v.string(),
  planId: v.id('plans'),
  userId: v.id('users'),
  expiresAt: v.number(),
}).index('by_userId', ['userId']);

const budgets = defineTable({
  name: v.string(),
  userId: v.id('users'),
  email: v.string(),
  description: v.optional(v.string()),
  targetAmount: v.optional(v.number()),
}).index('by_userId', ['userId']);

const budgetItems = defineTable({
  budgetId: v.id('budgets'),
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  addedAt: v.number(), // timestamp
}).index('by_budgetId', ['budgetId']);

export default defineSchema({
  users,
  requestCounts,
  plans,
  subscription,
  primaryCurrency,
  budgets,
  budgetItems,
});
