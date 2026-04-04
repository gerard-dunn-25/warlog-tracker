import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const equipmentItem = v.object({
  name: v.string(),
  cost: v.number(),
  strengthBonus: v.optional(v.number()),
  armourSave: v.optional(v.number()),
  notes: v.optional(v.string()),
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

export const updateExperience = mutation({
  args: {
    sessionWarriorId: v.id('sessionWarriors'),
    experience: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const sessionWarrior = await ctx.db.get(args.sessionWarriorId)
    if (!sessionWarrior) throw new Error('Session warrior not found')

    const session = await ctx.db.get(sessionWarrior.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.sessionWarriorId, { experience: args.experience })
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
