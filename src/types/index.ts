import { Id } from '../../convex/_generated/dataModel'

export type Stats = {
  movement: number
  weaponSkill: number
  ballisticSkill: number
  strength: number
  toughness: number
  wounds: number
  initiative: number
  attacks: number
  leadership: number
}

export type EquipmentItem = {
  name: string
  cost: number
  strengthBonus?: number
  armourSave?: number
  notes?: string
}

export type Warband = {
  _id: Id<'warbands'>
  userId: string
  name: string
  factionType: string
  notes?: string
}

export type Warrior = {
  _id: Id<'warriors'>
  warbandId: Id<'warbands'>
  name: string
  role: 'champion' | 'follower'
  type: string
  coinValue: number
  stats: Stats
  equipment: EquipmentItem[]
  skills: string[]
}

export type SessionWarrior = {
  _id: Id<'sessionWarriors'>
  sessionId: Id<'sessions'>
  warriorId: Id<'warriors'>
  warbandId: Id<'warbands'>
  name: string
  role: 'champion' | 'follower'
  type: string
  coinValue: number
  isActive: boolean
  experience: number
  stats: Stats
  equipment: EquipmentItem[]
  skills: string[]
  injuries: string[]
}

export type PlayerSlot = {
  label: string
  warbandId?: Id<'warbands'>
  coinBudget?: number
  gold: number
}

export type Session = {
  _id: Id<'sessions'>
  hostUserId: string
  name: string
  status: 'active' | 'paused' | 'ended'
  playerSlots: PlayerSlot[]
  createdAt: number
  updatedAt: number
}
