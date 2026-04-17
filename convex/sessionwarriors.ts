import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const equipmentItem = v.object({
  name: v.string(),
  strengthBonus: v.optional(v.float64()),
  penetration: v.optional(v.float64()),
  invulnerableSave: v.optional(v.float64()),
  armourSave: v.optional(v.float64()),
  notes: v.optional(v.string()),
  category: v.optional(v.union(v.literal('weapon'), v.literal('armour'))),
})

export const listBySession = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sessionWarriors')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .collect()
  },
})

export const listBySessionAndWarband = query({
  args: {
    sessionId: v.id('sessions'),
    warbandId: v.id('warbands'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sessionWarriors')
      .withIndex('by_session_and_warband', (q) =>
        q.eq('sessionId', args.sessionId).eq('warbandId', args.warbandId),
      )
      .collect()
  },
})

export const setActive = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    // Verify host ownership via session
    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.sessionWarriorId, { isActive: args.isActive })
  },
})

export const updateStats = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    stats: v.object({
      movement: v.number(),
      weaponSkill: v.number(),
      ballisticSkill: v.number(),
      strength: v.number(),
      toughness: v.number(),
      wounds: v.number(),
      initiative: v.number(),
      attacks: v.number(),
      leadership: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.sessionWarriorId, { stats: args.stats })
  },
})

export const updateName = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.sessionWarriorId, { name: args.name })
  },
})

export const addEquipment = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    item: equipmentItem,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    // Server-side validation for armour-related fields on the item
    const validateArmourField = (label: string, value: number | undefined) => {
      if (value === undefined) return
      if (!Number.isInteger(value))
        throw new Error(`${label} must be an integer`)
    }

    validateArmourField('penetration', args.item.penetration)
    validateArmourField('armourSave', args.item.armourSave)
    validateArmourField('invulnerableSave', args.item.invulnerableSave)

    if (
      args.item.penetration !== undefined &&
      (args.item.penetration < -6 || args.item.penetration > 6)
    )
      throw new Error('penetration must be between -6 and 6')

    if (
      args.item.armourSave !== undefined &&
      (args.item.armourSave < 2 || args.item.armourSave > 6)
    )
      throw new Error('armourSave must be between 2 and 6')

    if (
      args.item.invulnerableSave !== undefined &&
      (args.item.invulnerableSave < 2 || args.item.invulnerableSave > 6)
    )
      throw new Error('invulnerableSave must be between 2 and 6')

    // Enforce max 3 of the same equipment per unit (one entry per item)
    const existingCounts: Record<string, number> = {}
    for (const e of sessionWarrior.equipment) {
      const eq = e as { name: string }
      existingCounts[eq.name] = (existingCounts[eq.name] || 0) + 1
    }
    const total = (existingCounts[args.item.name] || 0) + 1
    if (total > 3)
      throw new Error('Cannot have more than 3 of the same equipment')

    await ctx.db.patch(args.sessionWarriorId, {
      equipment: [...sessionWarrior.equipment, args.item],
    })
  },
})

export const removeEquipment = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    equipmentIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    const updatedEquipment = sessionWarrior.equipment.filter(
      (_, i) => i !== args.equipmentIndex,
    )

    await ctx.db.patch(args.sessionWarriorId, { equipment: updatedEquipment })
  },
})

export const updateEquipment = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    equipment: v.array(equipmentItem),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    // Validate max 3 identical items in provided equipment list
    const counts: Record<string, number> = {}
    for (const it of args.equipment) {
      // Server-side validation per item
      const validateArmourField = (
        label: string,
        value: number | undefined,
      ) => {
        if (value === undefined) return
        if (!Number.isInteger(value))
          throw new Error(`${label} must be an integer`)
      }

      validateArmourField('penetration', it.penetration)
      validateArmourField('armourSave', it.armourSave)
      validateArmourField('invulnerableSave', it.invulnerableSave)

      if (
        it.penetration !== undefined &&
        (it.penetration < -6 || it.penetration > 6)
      )
        throw new Error('penetration must be between -6 and 6')

      if (
        it.armourSave !== undefined &&
        (it.armourSave < 2 || it.armourSave > 6)
      )
        throw new Error('armourSave must be between 2 and 6')

      if (
        it.invulnerableSave !== undefined &&
        (it.invulnerableSave < 2 || it.invulnerableSave > 6)
      )
        throw new Error('invulnerableSave must be between 2 and 6')

      counts[it.name] = (counts[it.name] || 0) + 1
      if (counts[it.name] > 3)
        throw new Error('Cannot have more than 3 of the same equipment')
    }

    await ctx.db.patch(args.sessionWarriorId, { equipment: args.equipment })
  },
})

export const addInjury = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    injury: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.sessionWarriorId, {
      injuries: [...sessionWarrior.injuries, args.injury],
    })
  },
})

export const removeInjury = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    injuryIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    const updatedInjuries = sessionWarrior.injuries.filter(
      (_, i) => i !== args.injuryIndex,
    )

    await ctx.db.patch(args.sessionWarriorId, { injuries: updatedInjuries })
  },
})

export const markDead = mutation({
  args: { sessionWarriorId: v.id('sessionWarriors') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.sessionWarriorId, {
      isDead: true,
      deadRound: session.currentRound,
    })
  },
})

export const restore = mutation({
  args: { sessionWarriorId: v.id('sessionWarriors') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.sessionWarriorId, {
      isDead: false,
      deadRound: undefined,
    })
  },
})
