import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { SkillCatalogItem } from '@/types'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export default function SkillsPage() {
  const items = (useQuery(api.skills.list) as SkillCatalogItem[]) ?? []
  const create = useMutation(api.skills.create)
  const remove = useMutation(api.skills.remove)
  const update = useMutation(api.skills.update)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const [editingId, setEditingId] = useState<Id<'skillsCatalog'> | null>(null)
  const [deletingId, setDeletingId] = useState<Id<'skillsCatalog'> | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    await create({ name, description: description || undefined })
    setName('')
    setDescription('')
    setCreateOpen(false)
  }

  function startEdit(it: SkillCatalogItem) {
    setEditingId(it._id)
    setEditName(it.name)
    setEditDescription(it.description ?? '')
  }

  async function saveEdit(id: Id<'skillsCatalog'>) {
    await update({
      skillId: id,
      name: editName || undefined,
      description: editDescription || undefined,
    })
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-background">
            Skills
          </h1>
          <p className="text-sm text-background">
            Manage shared skill definitions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{items.length} skills</Badge>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <Button onClick={() => setCreateOpen(true)}>Add Skill</Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit">Add Skill</Button>
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
                    {it.description}
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
                      Description
                    </Label>
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
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
              ) : null}
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
            <h3 className="text-lg font-medium">Delete skill?</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This will permanently delete the skill definition.
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
                  await remove({ skillId: deletingId })
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
