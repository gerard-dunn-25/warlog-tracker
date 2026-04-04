import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { EquipmentCatalogItem } from '@/types'

type EquipmentItem = {
  name: string
  cost: number
  strengthBonus?: number
  armourSave?: number
  notes?: string
}

export default function EquipmentSelector({
  selected = [],
  onChange,
}: {
  selected?: EquipmentItem[]
  onChange: (items: EquipmentItem[]) => void
}) {
  const items = (useQuery(api.equipment.list) as EquipmentCatalogItem[]) ?? []
  const create = useMutation(api.equipment.create)
  const [localSelected, setLocalSelected] = useState<EquipmentItem[]>(selected)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [cost, setCost] = useState(0)

  function toggle(item: EquipmentItem) {
    const exists = localSelected.find(
      (i) => i.name === item.name && i.cost === item.cost,
    )
    let next
    if (exists) {
      next = localSelected.filter(
        (i) => !(i.name === item.name && i.cost === item.cost),
      )
    } else {
      next = [...localSelected, item]
    }
    setLocalSelected(next)
    onChange(next)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await create({ name, cost })
    // refetch via the query hook; just reset form
    setName('')
    setCost(0)
    setCreating(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2">
        {items.map((it: EquipmentCatalogItem) => (
          <label
            key={it._id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={
                  !!localSelected.find(
                    (s) => s.name === it.name && s.cost === it.cost,
                  )
                }
                onChange={() => toggle(it)}
              />
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-muted-foreground">
                  {it.cost} coin
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {it.strengthBonus ? `S+${it.strengthBonus}` : ''}
            </div>
          </label>
        ))}
      </div>

      {creating ? (
        <form onSubmit={handleCreate} className="flex gap-2">
          <div className="flex-1">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="w-28">
            <Label>Cost</Label>
            <Input
              type="number"
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit">Add</Button>
          </div>
        </form>
      ) : (
        <Button variant="ghost" onClick={() => setCreating(true)}>
          Create new equipment
        </Button>
      )}
    </div>
  )
}
