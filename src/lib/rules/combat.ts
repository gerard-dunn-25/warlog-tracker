export type WarriorStats = {
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

export type CombatantInfo = {
  name: string
  stats: WarriorStats
  equipment: EquipmentItem[]
}

export type AttackResult = {
  toHit: number
  toWound: number
  armourSave: number | null
  effectiveStrength: number
  equipmentNotes: string[]
}

export type CombatComparison = {
  attacker: CombatantInfo
  defender: CombatantInfo
  strikesFirst: boolean
  result: AttackResult
}

export type FullCombatResult = {
  unitA: CombatantInfo
  unitB: CombatantInfo
  initiativeNote: string
  aAttacksB: CombatComparison
  bAttacksA: CombatComparison
}

// WS vs WS hit table — attacker WS (row) vs defender WS (column)
const HIT_TABLE: Record<number, Record<number, number>> = {
  1: { 1: 4, 2: 5, 3: 5, 4: 5, 5: 5, 6: 6 },
  2: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5, 6: 5 },
  3: { 1: 2, 2: 3, 3: 4, 4: 4, 5: 5, 6: 5 },
  4: { 1: 2, 2: 3, 3: 3, 4: 4, 5: 4, 6: 5 },
  5: { 1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4 },
  6: { 1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 4 },
}

// S vs T wound table — attacker S (row) vs defender T (column)
const WOUND_TABLE: Record<number, Record<number, number>> = {
  1: { 1: 4, 2: 5, 3: 6, 4: 6, 5: 6, 6: 6 },
  2: { 1: 3, 2: 4, 3: 5, 4: 6, 5: 6, 6: 6 },
  3: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 6 },
  4: { 1: 2, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 },
  5: { 1: 2, 2: 2, 3: 2, 4: 3, 5: 4, 6: 5 },
  6: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 3, 6: 4 },
}

function clamp(value: number, min = 1, max = 6): number {
  return Math.min(Math.max(value, min), max)
}

function resolveEffectiveStrength(combatant: CombatantInfo): number {
  const bonus = combatant.equipment.reduce(
    (total, item) => total + (item.strengthBonus ?? 0),
    0,
  )
  return clamp(combatant.stats.strength + bonus)
}

function resolveArmourSave(combatant: CombatantInfo): number | null {
  const saves = combatant.equipment
    .map((item) => item.armourSave)
    .filter((save): save is number => save !== undefined)

  if (saves.length === 0) return null

  // Best (lowest) armour save wins
  return Math.min(...saves)
}

function getEquipmentNotes(combatant: CombatantInfo): string[] {
  return combatant.equipment
    .filter((item) => item.notes !== undefined && item.notes.trim() !== '')
    .map((item) => `${item.name}: ${item.notes}`)
}

function calculateAttack(
  attacker: CombatantInfo,
  defender: CombatantInfo,
): AttackResult {
  const effectiveStrength = resolveEffectiveStrength(attacker)
  const armourSave = resolveArmourSave(defender)

  const ws = clamp(attacker.stats.weaponSkill)
  const defenderWs = clamp(defender.stats.weaponSkill)
  const t = clamp(defender.stats.toughness)
  const s = clamp(effectiveStrength)

  return {
    toHit: HIT_TABLE[ws][defenderWs],
    toWound: WOUND_TABLE[s][t],
    armourSave,
    effectiveStrength,
    equipmentNotes: getEquipmentNotes(attacker),
  }
}

function resolveInitiativeNote(
  unitA: CombatantInfo,
  unitB: CombatantInfo,
): string {
  const iA = unitA.stats.initiative
  const iB = unitB.stats.initiative

  if (iA > iB) return `${unitA.name} strikes first (I${iA} vs I${iB})`
  if (iB > iA) return `${unitB.name} strikes first (I${iB} vs I${iA})`
  return `${unitA.name} and ${unitB.name} strike simultaneously (I${iA})`
}

export function calculateCombat(
  unitA: CombatantInfo,
  unitB: CombatantInfo,
): FullCombatResult {
  const iA = unitA.stats.initiative
  const iB = unitB.stats.initiative

  return {
    unitA,
    unitB,
    initiativeNote: resolveInitiativeNote(unitA, unitB),
    aAttacksB: {
      attacker: unitA,
      defender: unitB,
      strikesFirst: iA >= iB,
      result: calculateAttack(unitA, unitB),
    },
    bAttacksA: {
      attacker: unitB,
      defender: unitA,
      strikesFirst: iB >= iA,
      result: calculateAttack(unitB, unitA),
    },
  }
}
