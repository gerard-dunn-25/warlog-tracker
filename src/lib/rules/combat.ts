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
  strengthBonus?: number
  armourSave?: number
  penetration?: number
  invulnerableSave?: number
  notes?: string
}

export type CombatantInfo = {
  name: string
  stats: WarriorStats
  equipment: EquipmentItem[]
}

export type ArmourSaveResult = {
  base: number | null
  modified: number | null
  invulnerable: number | null
  effective: number | null
}

export type AttackResult = {
  toHit: number
  toWound: number
  armourSave: ArmourSaveResult
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

export function resolveArmourSave(
  combatant: CombatantInfo,
  attackerPenetration = 0,
): ArmourSaveResult {
  const baseSaves = combatant.equipment
    .map((item) => item.armourSave)
    .filter((s): s is number => s !== undefined)

  const invuls = combatant.equipment
    .map((item) => item.invulnerableSave)
    .filter((s): s is number => s !== undefined)

  const base = baseSaves.length === 0 ? null : Math.min(...baseSaves)
  const invulnerable = invuls.length === 0 ? null : Math.min(...invuls)

  const modified = base !== null ? base + attackerPenetration : null

  // Regular save can only be attempted if modified <= 6
  const effectiveRegular = modified !== null && modified <= 6 ? modified : null

  // invulnerable saves ignore penetration
  const effective = [effectiveRegular, invulnerable].filter(
    (v) => v !== null,
  ) as number[]
  const chosen = effective.length === 0 ? null : Math.min(...effective)

  return {
    base,
    modified,
    invulnerable,
    effective: chosen,
  }
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
  const attackerPen = attacker.equipment
    .map((it) => it.penetration ?? 0)
    .reduce((max, v) => Math.max(max, v), 0)
  const armourSave = resolveArmourSave(defender, attackerPen)

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
