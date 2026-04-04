import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// equipment item shape defined in schema; kept inline in handlers when needed

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('equipmentCatalog').collect()
  },
})

export const get = query({
  args: { equipmentId: v.id('equipmentCatalog') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.equipmentId)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    cost: v.number(),
    strengthBonus: v.optional(v.number()),
    armourSave: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const payload = {
      ...args,
      createdBy: identity.subject,
      createdAt: Date.now(),
    }

    return await ctx.db.insert('equipmentCatalog', payload)
  },
})

export const update = mutation({
  args: {
    equipmentId: v.id('equipmentCatalog'),
    name: v.optional(v.string()),
    cost: v.optional(v.number()),
    strengthBonus: v.optional(v.number()),
    armourSave: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const item = await ctx.db.get(args.equipmentId)
    if (!item) throw new Error('Equipment not found')
    if (item.createdBy !== identity.subject) throw new Error('Unauthorized')

    const { equipmentId, ...fields } = args
    await ctx.db.patch(equipmentId, fields)
  },
})

export const remove = mutation({
  args: { equipmentId: v.id('equipmentCatalog') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const item = await ctx.db.get(args.equipmentId)
    if (!item) throw new Error('Equipment not found')
    if (item.createdBy !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.delete(args.equipmentId)
  },
})
