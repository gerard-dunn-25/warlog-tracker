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
import type { SessionWarrior, Stats, EquipmentItem } from '@/types'

export default function SessionWarriorEditDialog({
  warrior,
  onClose,
}: {
  warrior: SessionWarrior
  onClose: () => void
}) {
  const [name, setName] = useState(warrior.name)
  const [stats, setStats] = useState<Stats>(warrior.stats)
  const [experience, setExperience] = useState(warrior.experience)
  const [equipment, setEquipment] = useState<EquipmentItem[]>(
    warrior.equipment || [],
  )

  const updateStats = useMutation(api.sessionwarriors.updateStats)
  const updateExperience = useMutation(api.sessionwarriors.updateExperience)
  const updateEquipment = useMutation(api.sessionwarriors.updateEquipment)
  const updateName = useMutation(api.sessionwarriors.updateName)
  const markDead = useMutation(api.sessionwarriors.markDead)
  const restore = useMutation(api.sessionwarriors.restore)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await updateName({ sessionWarriorId: warrior._id, name })
    await updateStats({ sessionWarriorId: warrior._id, stats })
    await updateExperience({ sessionWarriorId: warrior._id, experience })
    await updateEquipment({ sessionWarriorId: warrior._id, equipment })
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
            {(Object.keys(stats) as (keyof Stats)[]).map((key) => (
              <div key={String(key)} className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">{key}</Label>
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
          <Label>Experience</Label>
          <Input
            type="number"
            value={experience}
            onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Equipment</Label>
          <EquipmentSelector
            selected={equipment}
            onChange={(items: EquipmentItem[]) => setEquipment(items)}
          />
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
