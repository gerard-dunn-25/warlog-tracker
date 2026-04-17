import React, { useMemo, useState } from 'react'
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
  const rawItems = useQuery(api.equipment.list) as
    | EquipmentCatalogItem[]
    | undefined
    | null

  const items = useMemo(
    () => (rawItems ?? []) as EquipmentCatalogItem[],
    [rawItems],
  )
  const create = useMutation(api.equipment.create)
  const remove = useMutation(api.equipment.remove)
  const update = useMutation(api.equipment.update)
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createStrength, setCreateStrength] = useState<number | undefined>(
    undefined,
  )
  const [createPenetration, setCreatePenetration] = useState<
    number | undefined
  >(undefined)
  const [createInvul, setCreateInvul] = useState<number | undefined>(undefined)
  const [createArmourSave, setCreateArmourSave] = useState<number | undefined>(
    undefined,
  )
  const [createNotes, setCreateNotes] = useState('')
  const [createCategory, setCreateCategory] = useState<
    'weapon' | 'armour' | ''
  >('')

  const [editingId, setEditingId] = useState<Id<'equipmentCatalog'> | null>(
    null,
  )
  const [deletingId, setDeletingId] = useState<Id<'equipmentCatalog'> | null>(
    null,
  )
  const [editName, setEditName] = useState('')
  const [editStrength, setEditStrength] = useState<number | undefined>(
    undefined,
  )
  const [editPenetration, setEditPenetration] = useState<number | undefined>(
    undefined,
  )
  const [editInvul, setEditInvul] = useState<number | undefined>(undefined)
  const [editArmourSave, setEditArmourSave] = useState<number | undefined>(
    undefined,
  )
  const [editNotes, setEditNotes] = useState('')
  const [editCategory, setEditCategory] = useState<'weapon' | 'armour' | ''>('')

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    await create({
      name,
      strengthBonus: createStrength ?? undefined,
      category: createCategory || undefined,
      penetration: createPenetration ?? undefined,
      invulnerableSave: createInvul ?? undefined,
      armourSave: createArmourSave ?? undefined,
      notes: createNotes || undefined,
    })
    setName('')
    setCreateStrength(undefined)
    setCreatePenetration(undefined)
    setCreateInvul(undefined)
    setCreateArmourSave(undefined)
    setCreateNotes('')
    setCreateCategory('')
    setCreateOpen(false)
  }

  function startEdit(it: EquipmentCatalogItem) {
    setEditingId(it._id)
    setEditName(it.name)
    setEditStrength(it.strengthBonus)
    setEditPenetration(it.penetration)
    setEditInvul(it.invulnerableSave)
    setEditArmourSave(it.armourSave)
    setEditNotes(it.notes ?? '')
    setEditCategory(it.category ?? '')
  }

  async function saveEdit(id: Id<'equipmentCatalog'>) {
    await update({
      equipmentId: id,
      name: editName || undefined,
      strengthBonus: editStrength ?? undefined,
      category: editCategory || undefined,
      penetration: editPenetration ?? undefined,
      invulnerableSave: editInvul ?? undefined,
      armourSave: editArmourSave ?? undefined,
      notes: editNotes || undefined,
    })
    setEditingId(null)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        (it.notes || '').toLowerCase().includes(q),
    )
  }, [items, search])

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
          <Input
            placeholder="Search equipment by name or notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Badge variant="default">
            {filtered.length} / {items.length}
          </Badge>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <Button
          onClick={() => {
            setName('')
            setCreateStrength(undefined)
            setCreatePenetration(undefined)
            setCreateInvul(undefined)
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
                <Label>Penetration (AP)</Label>
                <Input
                  type="number"
                  value={createPenetration ?? ''}
                  onChange={(e) =>
                    setCreatePenetration(
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
              <div>
                <Label>Invulnerable Save</Label>
                <Input
                  type="number"
                  value={createInvul ?? ''}
                  onChange={(e) =>
                    setCreateInvul(
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

            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <select
                value={createCategory}
                onChange={(e) =>
                  setCreateCategory(e.target.value as 'weapon' | 'armour' | '')
                }
                className="h-9 w-full rounded-md border border-input bg-zinc-900 px-3 py-1 text-sm text-background"
              >
                <option value="">(unset)</option>
                <option value="weapon">Weapon</option>
                <option value="armour">Armour</option>
              </select>
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
        {filtered.map((it) => (
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
                        Category
                      </Label>
                      <select
                        value={editCategory}
                        onChange={(e) =>
                          setEditCategory(
                            e.target.value as 'weapon' | 'armour' | '',
                          )
                        }
                        className="h-9 w-full rounded-md border border-input bg-zinc-900 px-3 py-1 text-sm text-background"
                      >
                        <option value="">(unset)</option>
                        <option value="weapon">Weapon</option>
                        <option value="armour">Armour</option>
                      </select>
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
                        Penetration (AP)
                      </Label>
                      <Input
                        type="number"
                        value={editPenetration ?? ''}
                        onChange={(e) =>
                          setEditPenetration(
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
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Invulnerable Save
                      </Label>
                      <Input
                        type="number"
                        value={editInvul ?? ''}
                        onChange={(e) =>
                          setEditInvul(
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
                  <div className="text-xs text-muted-foreground">
                    {it.strengthBonus ? `S+${it.strengthBonus}` : ''}{' '}
                    {it.penetration ? `AP ${it.penetration}` : ''}{' '}
                    {it.armourSave ? `AS ${it.armourSave}` : ''}{' '}
                    {it.invulnerableSave ? `Inv ${it.invulnerableSave}` : ''}
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
