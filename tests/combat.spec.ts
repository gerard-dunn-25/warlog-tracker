import { describe, it, expect } from 'vitest'
import { resolveArmourSave, CombatantInfo } from '../src/lib/rules/combat'

function makeCombatant(baseAS?: number, invul?: number): CombatantInfo {
  return {
    name: 'Def',
    stats: {
      movement: 4,
      weaponSkill: 3,
      ballisticSkill: 3,
      strength: 3,
      toughness: 3,
      wounds: 1,
      initiative: 3,
      attacks: 1,
      leadership: 7,
    },
    equipment: [
      ...(baseAS !== undefined ? [{ name: 'armour', armourSave: baseAS }] : []),
      ...(invul !== undefined
        ? [{ name: 'invul', invulnerableSave: invul }]
        : []),
    ],
  }
}

describe('resolveArmourSave', () => {
  it('returns base when no penetration', () => {
    const def = makeCombatant(3)
    const res = resolveArmourSave(def, 0)
    expect(res.base).toBe(3)
    expect(res.modified).toBe(3)
    expect(res.effective).toBe(3)
  })

  it('ap modifies save when <=6', () => {
    const def = makeCombatant(3)
    const res = resolveArmourSave(def, 2)
    expect(res.modified).toBe(5)
    expect(res.effective).toBe(5)
  })

  it('ap can make regular save impossible', () => {
    const def = makeCombatant(3)
    const res = resolveArmourSave(def, 4)
    expect(res.modified).toBe(7)
    expect(res.effective).toBe(null)
  })

  it('invulnerable save applies when regular removed by ap', () => {
    const def = makeCombatant(3, 5)
    const res = resolveArmourSave(def, 4)
    expect(res.modified).toBe(7)
    expect(res.invulnerable).toBe(5)
    expect(res.effective).toBe(5)
  })
})
