import type { EquipmentItem } from '@/types'

export function sanitizeEquipmentItem(item: Partial<EquipmentItem>) {
  return {
    name: item.name ?? '',
    cost: item.cost ?? 0,
    strengthBonus: item.strengthBonus ?? undefined,
    armourSave: item.armourSave ?? undefined,
    notes: item.notes ?? undefined,
  }
}

export function sanitizeEquipmentList(
  items: Partial<EquipmentItem>[] | undefined,
) {
  return (items || []).map(sanitizeEquipmentItem)
}
