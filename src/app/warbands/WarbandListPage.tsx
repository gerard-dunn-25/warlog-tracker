import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function CreateWarbandDialog() {
  const createWarband = useMutation(api.warbands.create)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [factionType, setFactionType] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = await createWarband({ name, factionType, notes })
    setOpen(false)
    setName('')
    setFactionType('')
    setNotes('')
    navigate(`/warbands/${id}`)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Warband
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Warband</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="The Iron Company"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="factionType">Faction Type</Label>
              <Input
                id="factionType"
                value={factionType}
                onChange={(e) => setFactionType(e.target.value)}
                placeholder="Mercenary Company"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
            <Button type="submit" disabled={!name || !factionType}>
              Create
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function WarbandListPage() {
  const warbands = useQuery(api.warbands.list)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-background tracking-tight">
            Warbands
          </h1>
          <p className="text-background">Manage your warband library</p>
        </div>
        <CreateWarbandDialog />
      </div>

      {warbands === undefined && (
        <div className="flex justify-center py-12">
          <img
            src="/goblin-loading.gif"
            alt="Loading..."
            className="h-16 w-16 object-contain"
          />
        </div>
      )}

      {warbands?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-background">No warbands yet.</p>
          <p className="text-sm text-background">
            Create your first warband to get started.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {warbands?.map((warband) => (
          <Card
            key={warband._id}
            className="bg-black/30 backdrop-blur-sm border-white/20 cursor-pointer transition-colors"
            onClick={() => navigate(`/warbands/${warband._id}`)}
          >
            <CardHeader>
              <CardTitle className="text-background">{warband.name}</CardTitle>
              <CardDescription className="text-background">
                {warband.factionType}
              </CardDescription>
            </CardHeader>
            {warband.notes && (
              <CardContent>
                <p className="text-sm text-background">{warband.notes}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
