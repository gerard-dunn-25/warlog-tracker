import type { EquipmentItem } from '@/types'

export function sanitizeEquipmentItem(item: Partial<EquipmentItem>) {
  return {
    name: item.name ?? '',
    strengthBonus: item.strengthBonus ?? undefined,
    armourSave: item.armourSave ?? undefined,
    notes: item.notes ?? undefined,
  }
}

// Expand items with a `quantity` into multiple entries (one per item).
export function sanitizeEquipmentList(
  items: Partial<EquipmentItem>[] | undefined,
) {
  const expanded: EquipmentItem[] = []
  for (const it of items || []) {
    const qty =
      typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : 1
    for (let i = 0; i < qty; i++) {
      expanded.push(sanitizeEquipmentItem(it) as EquipmentItem)
    }
  }

  const counts: Record<string, number> = {}
  for (const it of expanded) {
    counts[it.name] = (counts[it.name] || 0) + 1
    if (counts[it.name] > 3) {
      throw new Error('Cannot have more than 3 of the same equipment')
    }
  }

  return expanded
}
