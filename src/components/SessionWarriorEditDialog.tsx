import React, { useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import EquipmentSelector from '@/components/EquipmentSelector'
import { sanitizeEquipmentList } from '@/lib/sanitize'
import type { SessionWarrior, Stats, EquipmentItem } from '@/types'

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

const STAT_ORDER: (keyof Stats)[] = [
  'movement',
  'weaponSkill',
  'ballisticSkill',
  'strength',
  'toughness',
  'wounds',
  'initiative',
  'attacks',
  'leadership',
]

export default function SessionWarriorEditDialog({
  warrior,
  onClose,
}: {
  warrior: SessionWarrior
  onClose: () => void
}) {
  const [name, setName] = useState(warrior.name)
  const [stats, setStats] = useState<Stats>(warrior.stats)
  const [equipment, setEquipment] = useState<EquipmentItem[]>(
    warrior.equipment || [],
  )

  const updateStats = useMutation(api.sessionwarriors.updateStats)
  const updateEquipment = useMutation(api.sessionwarriors.updateEquipment)
  const updateName = useMutation(api.sessionwarriors.updateName)
  const markDead = useMutation(api.sessionwarriors.markDead)
  const restore = useMutation(api.sessionwarriors.restore)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await updateName({ sessionWarriorId: warrior._id, name })
    await updateStats({ sessionWarriorId: warrior._id, stats })
    try {
      await updateEquipment({
        sessionWarriorId: warrior._id,
        equipment: sanitizeEquipmentList(equipment),
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      window.alert(message || 'Failed to update equipment')
      return
    }
    onClose()
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Unit</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Stats</Label>
          <div className="grid grid-cols-3 gap-2">
            {STAT_ORDER.map((key) => (
              <div key={String(key)} className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  {STAT_LABELS[key]}
                </Label>
                <Input
                  type="number"
                  value={stats[key] as number}
                  onChange={(e) =>
                    setStats(
                      (prev) =>
                        ({
                          ...prev,
                          [key]: parseInt(e.target.value) || 0,
                        }) as Stats,
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Equipment</Label>
          <EquipmentSelector
            selected={equipment}
            onChange={(items: EquipmentItem[]) => setEquipment(items)}
          />
          {equipment.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm">Selected Items</Label>
              <div className="flex flex-col gap-2 mt-1">
                {equipment.map((it, idx) => (
                  <div
                    key={`${it.name}-${idx}`}
                    className="flex items-center justify-between gap-2 bg-muted p-2 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {it.notes}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">x{it.quantity ?? 1}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEquipment((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          {!warrior.isDead ? (
            <Button
              variant="destructive"
              onClick={() => markDead({ sessionWarriorId: warrior._id })}
              type="button"
            >
              Mark Dead
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => restore({ sessionWarriorId: warrior._id })}
              type="button"
            >
              Restore
            </Button>
          )}
        </div>
      </form>
    </DialogContent>
  )
}
