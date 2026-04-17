import React, { useMemo, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { EquipmentCatalogItem, EquipmentItem } from '@/types'

// use `EquipmentItem` from shared `src/types`

export default function EquipmentSelector({
  selected = [],
  onChange,
}: {
  selected?: EquipmentItem[]
  onChange: (items: EquipmentItem[]) => void
}) {
  const rawItems = useQuery(api.equipment.list) as
    | EquipmentCatalogItem[]
    | undefined
    | null

  const items = useMemo(
    () => (rawItems ?? []) as EquipmentCatalogItem[],
    [rawItems],
  )
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        (it.notes || '').toLowerCase().includes(q),
    )
  }, [items, search])
  const create = useMutation(api.equipment.create)
  const [localSelected, setLocalSelected] = useState<EquipmentItem[]>(selected)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  function toggleCatalogItem(item: EquipmentCatalogItem) {
    const exists = localSelected.find((i) => i.name === item.name)
    let next: EquipmentItem[]
    if (exists) {
      next = localSelected.filter((i) => !(i.name === item.name))
    } else {
      next = [
        ...localSelected,
        {
          name: item.name,
          strengthBonus: item.strengthBonus,
          armourSave: item.armourSave,
          notes: item.notes,
          penetration: item.penetration,
          invulnerableSave: item.invulnerableSave,
          quantity: 1,
          category: item.category,
        },
      ]
    }
    setLocalSelected(next)
    onChange(next)
  }

  function setQuantity(name: string, qty: number) {
    const next = localSelected
      .map((i) => (i.name === name ? { ...i, quantity: qty } : i))
      .filter(Boolean) as EquipmentItem[]
    // remove items with qty <= 0
    const cleaned = next.filter((i) => (i.quantity ?? 1) > 0)
    setLocalSelected(cleaned)
    onChange(cleaned)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await create({ name })
    // refetch via the query hook; just reset form
    setName('')
    setCreating(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search equipment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button variant="ghost" onClick={() => setSearch('')}>
            Clear
          </Button>
        </div>
        {filtered.map((it: EquipmentCatalogItem) => {
          const selectedItem = localSelected.find((s) => s.name === it.name)
          return (
            <label
              key={it._id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!selectedItem}
                  onChange={() => toggleCatalogItem(it)}
                />
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {it.notes}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground mr-2">
                  {it.strengthBonus ? `S+${it.strengthBonus}` : ''}
                </div>
                {selectedItem ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const qty = (selectedItem.quantity ?? 1) - 1
                        if (qty <= 0) {
                          toggleCatalogItem(it)
                        } else {
                          setQuantity(it.name, qty)
                        }
                      }}
                    >
                      -
                    </Button>
                    <div className="text-sm">{selectedItem.quantity ?? 1}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const qty = Math.min(
                          3,
                          (selectedItem.quantity ?? 1) + 1,
                        )
                        setQuantity(it.name, qty)
                      }}
                    >
                      +
                    </Button>
                  </div>
                ) : null}
              </div>
            </label>
          )
        })}
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
