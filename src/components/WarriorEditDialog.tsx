import React, { useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import EquipmentSelector from '@/components/EquipmentSelector'
import type { EquipmentItem, Warrior, Stats } from '@/types'

const STAT_LABELS: Record<keyof Stats, string> = {
  movement: 'M',
  weaponSkill: 'WS',
  ballisticSkill: 'BS',
  strength: 'S',
  toughness: 'T',
  wounds: 'W',
  initiative: 'I',
  attacks: 'A',
  leadership: 'Ld',
}

export default function WarriorEditDialog({
  warrior,
  onClose,
  onSave,
}: {
  warrior: Warrior
  onClose: () => void
  onSave: (data: Partial<Warrior>) => Promise<void>
}) {
  const [name, setName] = useState(warrior.name)
  const [type, setType] = useState(warrior.type)
  const [role, setRole] = useState<'champion' | 'follower'>(warrior.role)
  const [coinValue, setCoinValue] = useState(warrior.coinValue || 0)
  const [stats, setStats] = useState<Stats>(warrior.stats)
  const [equipment, setEquipment] = useState<EquipmentItem[]>(
    warrior.equipment || [],
  )

  function handleStatChange(stat: keyof Stats, value: string) {
    setStats((prev) => ({ ...prev, [stat]: parseInt(value) || 0 }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSave({ name, type, role, coinValue, stats, equipment })
    onClose()
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Warrior</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Type</Label>
          <Input
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Role</Label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'champion' | 'follower')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="champion">Champion</option>
            <option value="follower">Follower</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Coin Value</Label>
          <Input
            type="number"
            value={coinValue}
            onChange={(e) => setCoinValue(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Stats</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(STAT_LABELS) as (keyof Stats)[]).map((key) => (
              <div key={String(key)} className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  {STAT_LABELS[key]}
                </Label>
                <Input
                  type="number"
                  value={stats[key]}
                  onChange={(e) => handleStatChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Equipment</Label>
          <EquipmentSelector selected={equipment} onChange={setEquipment} />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
