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
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import type { Stats } from '@/types'

const DEFAULT_STATS: Stats = {
  movement: 4,
  weaponSkill: 3,
  ballisticSkill: 3,
  strength: 3,
  toughness: 3,
  wounds: 1,
  initiative: 3,
  attacks: 1,
  leadership: 7,
}

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

export default function CreateWarriorDialog({
  warbandId,
  onClose,
}: {
  warbandId: Id<'warbands'>
  onClose: () => void
}) {
  const createWarrior = useMutation(api.warriors.create)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [role, setRole] = useState<'champion' | 'follower'>('follower')
  const [coinValue, setCoinValue] = useState(0)
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS)

  function handleStatChange(stat: keyof Stats, value: string) {
    setStats((prev) => ({ ...prev, [stat]: parseInt(value) || 0 }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createWarrior({
      warbandId,
      name,
      type,
      role,
      coinValue,
      stats,
      equipment: [],
      skills: [],
    })
    onClose()
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Warrior</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sigrid (optional)"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Warrior Type"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'champion' | 'follower')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="champion">Champion</option>
            <option value="follower">Follower</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="coinValue">Coin Value</Label>
          <Input
            id="coinValue"
            type="number"
            value={coinValue}
            onChange={(e) => setCoinValue(parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Stats</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(STAT_LABELS) as (keyof Stats)[]).map((key) => (
              <div key={String(key)} className="flex flex-col gap-1">
                <Label
                  htmlFor={String(key)}
                  className="text-xs text-muted-foreground"
                >
                  {STAT_LABELS[key]}
                </Label>
                <Input
                  id={String(key)}
                  type="number"
                  value={stats[key]}
                  onChange={(e) => handleStatChange(key, e.target.value)}
                  min={0}
                  max={10}
                />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={!type}>
          Add Warrior
        </Button>
      </form>
    </DialogContent>
  )
}
