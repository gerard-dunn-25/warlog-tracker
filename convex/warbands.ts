import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("warbands")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const get = query({
  args: { warbandId: v.id("warbands") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.warbandId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    factionType: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("warbands", {
      userId: identity.subject,
      name: args.name,
      factionType: args.factionType,
      notes: args.notes,
    });
  },
});

export const update = mutation({
  args: {
    warbandId: v.id("warbands"),
    name: v.optional(v.string()),
    factionType: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const warband = await ctx.db.get(args.warbandId);
    if (!warband) throw new Error("Warband not found");
    if (warband.userId !== identity.subject) throw new Error("Unauthorized");

    const { warbandId, ...fields } = args;
    await ctx.db.patch(warbandId, fields);
  },
});

export const remove = mutation({
  args: { warbandId: v.id("warbands") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const warband = await ctx.db.get(args.warbandId);
    if (!warband) throw new Error("Warband not found");
    if (warband.userId !== identity.subject) throw new Error("Unauthorized");

    // Remove all warriors in this warband
    const warriors = await ctx.db
      .query("warriors")
      .withIndex("by_warband", (q) => q.eq("warbandId", args.warbandId))
      .collect();

    await Promise.all(warriors.map((w) => ctx.db.delete(w._id)));
    await ctx.db.delete(args.warbandId);
  },
});