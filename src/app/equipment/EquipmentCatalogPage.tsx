import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { EquipmentCatalogItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function EquipmentCatalogPage() {
  const items = (useQuery(api.equipment.list) as EquipmentCatalogItem[]) ?? []
  const create = useMutation(api.equipment.create)
  const remove = useMutation(api.equipment.remove)
  const update = useMutation(api.equipment.update)
  const [name, setName] = useState('')
  const [cost, setCost] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [createStrength, setCreateStrength] = useState<number | undefined>(
    undefined,
  )
  const [createArmourSave, setCreateArmourSave] = useState<number | undefined>(
    undefined,
  )
  const [createNotes, setCreateNotes] = useState('')

  const [editingId, setEditingId] = useState<Id<'equipmentCatalog'> | null>(
    null,
  )
  const [deletingId, setDeletingId] = useState<Id<'equipmentCatalog'> | null>(
    null,
  )
  const [editName, setEditName] = useState('')
  const [editCost, setEditCost] = useState(0)
  const [editStrength, setEditStrength] = useState<number | undefined>(
    undefined,
  )
  const [editArmourSave, setEditArmourSave] = useState<number | undefined>(
    undefined,
  )
  const [editNotes, setEditNotes] = useState('')

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    await create({
      name,
      cost,
      strengthBonus: createStrength ?? undefined,
      armourSave: createArmourSave ?? undefined,
      notes: createNotes || undefined,
    })
    setName('')
    setCost(0)
    setCreateStrength(undefined)
    setCreateArmourSave(undefined)
    setCreateNotes('')
    setCreateOpen(false)
  }

  function startEdit(it: EquipmentCatalogItem) {
    setEditingId(it._id)
    setEditName(it.name)
    setEditCost(it.cost)
    setEditStrength(it.strengthBonus)
    setEditArmourSave(it.armourSave)
    setEditNotes(it.notes ?? '')
  }

  async function saveEdit(id: Id<'equipmentCatalog'>) {
    await update({
      equipmentId: id,
      name: editName || undefined,
      cost: editCost || undefined,
      strengthBonus: editStrength ?? undefined,
      armourSave: editArmourSave ?? undefined,
      notes: editNotes || undefined,
    })
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-background">
            Equipment Catalog
          </h1>
          <p className="text-sm text-background">
            Manage shared equipment items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{items.length} items</Badge>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <Button
          onClick={() => {
            setName('')
            setCost(0)
            setCreateStrength(undefined)
            setCreateArmourSave(undefined)
            setCreateNotes('')
            setCreateOpen(true)
          }}
        >
          Add Equipment
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Equipment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Longsword"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Strength Bonus</Label>
                <Input
                  type="number"
                  value={createStrength ?? ''}
                  onChange={(e) =>
                    setCreateStrength(
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                />
              </div>
              <div>
                <Label>Armour Save</Label>
                <Input
                  type="number"
                  value={createArmourSave ?? ''}
                  onChange={(e) =>
                    setCreateArmourSave(
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit">Add Equipment</Button>
              <Button
                variant="ghost"
                onClick={() => setCreateOpen(false)}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <Card
            key={it._id}
            className="bg-black/30 backdrop-blur-sm border-white/20"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-background">
                    {it.name}
                  </CardTitle>
                  <CardDescription className="text-background">
                    {it.notes}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(it)}
                  >
                    <Edit className="h-4 w-4 text-amber-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(it._id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {String(editingId) === String(it._id) ? (
                <div className="flex flex-col gap-2 text-background">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Name
                      </Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Cost
                      </Label>
                      <Input
                        type="number"
                        value={editCost}
                        onChange={(e) =>
                          setEditCost(parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Strength Bonus
                      </Label>
                      <Input
                        type="number"
                        value={editStrength ?? ''}
                        onChange={(e) =>
                          setEditStrength(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Armour Save
                      </Label>
                      <Input
                        type="number"
                        value={editArmourSave ?? ''}
                        onChange={(e) =>
                          setEditArmourSave(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Notes
                    </Label>
                    <Input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => saveEdit(it._id)}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      type="button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {it.cost} coin
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {it.strengthBonus ? `S+${it.strengthBonus}` : ''}{' '}
                    {it.armourSave ? `AS ${it.armourSave}` : ''}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
      >
        {deletingId && (
          <div className="rounded-lg bg-popover p-6">
            <h3 className="text-lg font-medium">Delete equipment?</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This will permanently delete the equipment item.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setDeletingId(null)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await remove({ equipmentId: deletingId })
                  setDeletingId(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
