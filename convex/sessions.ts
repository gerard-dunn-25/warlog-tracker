import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    return await ctx.db
      .query('sessions')
      .withIndex('by_host', (q) => q.eq('hostUserId', identity.subject))
      .collect()
  },
})

export const get = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    playerCount: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const playerSlots = Array.from({ length: args.playerCount }, (_, i) => ({
      label: `Player ${i + 1}`,
      warbandId: undefined,
    }))

    return await ctx.db.insert('sessions', {
      hostUserId: identity.subject,
      name: args.name,
      status: 'active',
      playerSlots,
      currentRound: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const advanceRound = mutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    const newRound = (session.currentRound || 1) + 1

    // Update session round
    await ctx.db.patch(args.sessionId, {
      currentRound: newRound,
      updatedAt: Date.now(),
    })

    // Restore any sessionWarriors who died in prior rounds
    const warriors = await ctx.db
      .query('sessionWarriors')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .collect()

    await Promise.all(
      warriors.map((w) => {
        if (w.isDead && w.deadRound != null && w.deadRound < newRound) {
          return ctx.db.patch(w._id, { isDead: false, deadRound: undefined })
        }
        return Promise.resolve()
      }),
    )
  },
})

export const updateStatus = mutation({
  args: {
    sessionId: v.id('sessions'),
    status: v.union(
      v.literal('active'),
      v.literal('paused'),
      v.literal('ended'),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    await ctx.db.patch(args.sessionId, {
      status: args.status,
      updatedAt: Date.now(),
    })
  },
})

export const assignWarband = mutation({
  args: {
    sessionId: v.id('sessions'),
    slotIndex: v.number(),
    warbandId: v.id('warbands'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    // Snapshot all library warriors into sessionWarriors
    const libraryWarriors = await ctx.db
      .query('warriors')
      .withIndex('by_warband', (q) => q.eq('warbandId', args.warbandId))
      .collect()

    // Remove any existing session warriors for this slot if reassigning
    const existingSessionWarriors = await ctx.db
      .query('sessionWarriors')
      .withIndex('by_session_and_warband', (q) =>
        q.eq('sessionId', args.sessionId).eq('warbandId', args.warbandId),
      )
      .collect()

    await Promise.all(existingSessionWarriors.map((w) => ctx.db.delete(w._id)))

    // Insert fresh snapshots
    await Promise.all(
      libraryWarriors.map((warrior) =>
        ctx.db.insert('sessionWarriors', {
          sessionId: args.sessionId,
          warriorId: warrior._id,
          warbandId: args.warbandId,
          name: warrior.name,
          role: warrior.role,
          type: warrior.type,
          isActive: false,
          isDead: false,
          deadRound: undefined,
          stats: { ...warrior.stats },
          equipment: [...warrior.equipment],
          skills: [...warrior.skills],
          injuries: [] as string[],
        }),
      ),
    )

    // Update the slot
    const updatedSlots = session.playerSlots.map((slot, i) =>
      i === args.slotIndex
        ? {
            ...slot,
            warbandId: args.warbandId,
          }
        : slot,
    )

    await ctx.db.patch(args.sessionId, {
      playerSlots: updatedSlots,
      updatedAt: Date.now(),
    })
  },
})

export const updateSlotLabel = mutation({
  args: {
    sessionId: v.id('sessions'),
    slotIndex: v.number(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')
    if (session.hostUserId !== identity.subject) throw new Error('Unauthorized')

    const updatedSlots = session.playerSlots.map((slot, i) =>
      i === args.slotIndex ? { ...slot, label: args.label } : slot,
    )

    await ctx.db.patch(args.sessionId, {
      playerSlots: updatedSlots,
      updatedAt: Date.now(),
    })
  },
})
