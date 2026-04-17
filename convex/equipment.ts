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
    strengthBonus: v.optional(v.number()),
    category: v.optional(v.union(v.literal('weapon'), v.literal('armour'))),
    penetration: v.optional(v.number()),
    invulnerableSave: v.optional(v.number()),
    armourSave: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    // Server-side validation for armour-related fields
    const validateArmourField = (label: string, value: number | undefined) => {
      if (value === undefined) return
      if (!Number.isInteger(value))
        throw new Error(`${label} must be an integer`)
    }

    validateArmourField('penetration', args.penetration)
    validateArmourField('armourSave', args.armourSave)
    validateArmourField('invulnerableSave', args.invulnerableSave)

    if (
      args.penetration !== undefined &&
      (args.penetration < -6 || args.penetration > 6)
    )
      throw new Error('penetration must be between -6 and 6')

    if (
      args.armourSave !== undefined &&
      (args.armourSave < 2 || args.armourSave > 6)
    )
      throw new Error('armourSave must be between 2 and 6')

    if (
      args.invulnerableSave !== undefined &&
      (args.invulnerableSave < 2 || args.invulnerableSave > 6)
    )
      throw new Error('invulnerableSave must be between 2 and 6')

    const payload = {
      name: args.name,
      strengthBonus: args.strengthBonus,
      category: args.category,
      penetration: args.penetration,
      invulnerableSave: args.invulnerableSave,
      armourSave: args.armourSave,
      notes: args.notes,
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
    strengthBonus: v.optional(v.number()),
    category: v.optional(v.union(v.literal('weapon'), v.literal('armour'))),
    penetration: v.optional(v.number()),
    invulnerableSave: v.optional(v.number()),
    armourSave: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const item = await ctx.db.get(args.equipmentId)
    if (!item) throw new Error('Equipment not found')
    if (item.createdBy !== identity.subject) throw new Error('Unauthorized')

    // Validate any provided armour-related fields
    const validateArmourField = (label: string, value: number | undefined) => {
      if (value === undefined) return
      if (!Number.isInteger(value))
        throw new Error(`${label} must be an integer`)
    }

    validateArmourField('penetration', args.penetration)
    validateArmourField('armourSave', args.armourSave)
    validateArmourField('invulnerableSave', args.invulnerableSave)

    if (
      args.penetration !== undefined &&
      (args.penetration < -6 || args.penetration > 6)
    )
      throw new Error('penetration must be between -6 and 6')

    if (
      args.armourSave !== undefined &&
      (args.armourSave < 2 || args.armourSave > 6)
    )
      throw new Error('armourSave must be between 2 and 6')

    if (
      args.invulnerableSave !== undefined &&
      (args.invulnerableSave < 2 || args.invulnerableSave > 6)
    )
      throw new Error('invulnerableSave must be between 2 and 6')

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
