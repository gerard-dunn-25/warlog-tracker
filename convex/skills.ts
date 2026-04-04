import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('skillsCatalog').collect()
  },
})

export const get = query({
  args: { skillId: v.id('skillsCatalog') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.skillId)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const payload = {
      ...args,
      createdBy: identity.subject,
      createdAt: Date.now(),
    }

    return await ctx.db.insert('skillsCatalog', payload)
  },
})

export const update = mutation({
  args: {
    skillId: v.id('skillsCatalog'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const item = await ctx.db.get(args.skillId)
    if (!item) throw new Error('Skill not found')
    if (item.createdBy !== identity.subject) throw new Error('Unauthorized')

    const { skillId, ...fields } = args
    await ctx.db.patch(skillId, fields)
  },
})

export const remove = mutation({
  args: { skillId: v.id('skillsCatalog') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const item = await ctx.db.get(args.skillId)
    if (!item) throw new Error('Skill not found')
    if (item.createdBy !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.delete(args.skillId)
  },
})
