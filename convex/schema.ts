import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const statsFields = {
  movement: v.number(),
  weaponSkill: v.number(),
  ballisticSkill: v.number(),
  strength: v.number(),
  toughness: v.number(),
  wounds: v.number(),
  initiative: v.number(),
  attacks: v.number(),
  leadership: v.number(),
}

const equipmentItem = v.object({
  name: v.string(),
  cost: v.number(),
  strengthBonus: v.optional(v.number()),
  armourSave: v.optional(v.number()),
  notes: v.optional(v.string()),
})

export default defineSchema({
  warbands: defineTable({
    userId: v.string(),
    name: v.string(),
    factionType: v.string(),
    notes: v.optional(v.string()),
  }).index('by_user', ['userId']),

  warriors: defineTable({
    warbandId: v.id('warbands'),
    name: v.string(),
    role: v.union(v.literal('champion'), v.literal('follower')),
    type: v.string(),
    coinValue: v.number(),
    stats: v.object(statsFields),
    equipment: v.array(equipmentItem),
    skills: v.array(v.string()),
  }).index('by_warband', ['warbandId']),

  sessions: defineTable({
    hostUserId: v.string(),
    name: v.string(),
    status: v.union(
      v.literal('active'),
      v.literal('paused'),
      v.literal('ended'),
    ),
    playerSlots: v.array(
      v.object({
        label: v.string(),
        warbandId: v.optional(v.id('warbands')),
        coinBudget: v.optional(v.number()),
        gold: v.number(), // earned during session
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_host', ['hostUserId']),

  sessionWarriors: defineTable({
    sessionId: v.id('sessions'),
    warriorId: v.id('warriors'),
    warbandId: v.id('warbands'),
    name: v.string(),
    role: v.union(v.literal('champion'), v.literal('follower')),
    type: v.string(),
    coinValue: v.number(),
    isActive: v.boolean(),
    experience: v.number(),
    stats: v.object(statsFields),
    equipment: v.array(equipmentItem),
    skills: v.array(v.string()),
    injuries: v.array(v.string()),
  })
    .index('by_session', ['sessionId'])
    .index('by_session_and_warband', ['sessionId', 'warbandId']),
})
