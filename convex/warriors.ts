import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const equipmentItem = v.object({
  name: v.string(),
  cost: v.number(),
  strengthBonus: v.optional(v.number()),
  armourSave: v.optional(v.number()),
  notes: v.optional(v.string()),
})

const statsFields = v.object({
  movement: v.number(),
  weaponSkill: v.number(),
  ballisticSkill: v.number(),
  strength: v.number(),
  toughness: v.number(),
  wounds: v.number(),
  initiative: v.number(),
  attacks: v.number(),
  leadership: v.number(),
})

export const listByWarband = query({
  args: { warbandId: v.id('warbands') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('warriors')
      .withIndex('by_warband', (q) => q.eq('warbandId', args.warbandId))
      .collect()
  },
})

export const get = query({
  args: { warriorId: v.id('warriors') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.warriorId)
  },
})

export const create = mutation({
  args: {
    warbandId: v.id('warbands'),
    name: v.string(),
    role: v.union(v.literal('champion'), v.literal('follower')),
    type: v.string(),
    coinValue: v.number(),
    stats: statsFields,
    equipment: v.array(equipmentItem),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    // Verify warband ownership
    const warband = await ctx.db.get(args.warbandId)
    if (!warband) throw new Error('Warband not found')
    if (warband.userId !== identity.subject) throw new Error('Unauthorized')

    return await ctx.db.insert('warriors', args)
  },
})

export const update = mutation({
  args: {
    warriorId: v.id('warriors'),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal('champion'), v.literal('follower'))),
    type: v.optional(v.string()),
    coinValue: v.optional(v.number()),
    stats: v.optional(statsFields),
    equipment: v.optional(v.array(equipmentItem)),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const warrior = await ctx.db.get(args.warriorId)
    if (!warrior) throw new Error('Warrior not found')

    // Verify ownership via warband
    const warband = await ctx.db.get(warrior.warbandId)
    if (!warband) throw new Error('Warband not found')
    if (warband.userId !== identity.subject) throw new Error('Unauthorized')

    const { warriorId, ...fields } = args
    await ctx.db.patch(warriorId, fields)
  },
})

export const remove = mutation({
  args: { warriorId: v.id('warriors') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const warrior = await ctx.db.get(args.warriorId)
    if (!warrior) throw new Error('Warrior not found')

    const warband = await ctx.db.get(warrior.warbandId)
    if (!warband) throw new Error('Warband not found')
    if (warband.userId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.delete(args.warriorId)
  },
})
