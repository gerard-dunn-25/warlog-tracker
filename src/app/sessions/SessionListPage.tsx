// src/app/sessions/SessionListPage.tsx
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
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
import { Badge } from '@/components/ui/badge'
import type { Session } from '@/types'

function CreateSessionDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const createSession = useMutation(api.sessions.create)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [playerCount, setPlayerCount] = useState<1 | 2 | 3 | 4>(2)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = await createSession({ name, playerCount })
    onClose()
    setName('')
    setPlayerCount(2)
    navigate(`/sessions/${id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/30 backdrop-blur-sm border-white/20">
        <DialogHeader>
          <DialogTitle className="text-background">New Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-background">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Skirmish at the Wyrdstone Fields"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-background">Players</Label>
            <div className="flex gap-2">
              {([1, 2, 3, 4] as const).map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={playerCount === n ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPlayerCount(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={!name}>
            Create Session
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const STATUS_BADGE: Record<
  Session['status'],
  'default' | 'secondary' | 'outline'
> = {
  active: 'default',
  paused: 'default',
  ended: 'default',
}

export default function SessionListPage() {
  const sessions = useQuery(api.sessions.list)
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-background font-bold tracking-tight">
            Sessions
          </h1>
          <p className="text-background">Manage your game sessions</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      <CreateSessionDialog open={creating} onClose={() => setCreating(false)} />

      {sessions === undefined && (
        <div className="flex justify-center py-12">
          <img
            src="/goblin-loading.gif"
            alt="Loading..."
            className="h-16 w-16 object-contain"
          />
        </div>
      )}

      {sessions?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">No sessions yet.</p>
          <p className="text-sm text-muted-foreground">
            Create a session to get started.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sessions?.map((session) => (
          <Card
            key={session._id}
            className="cursor-pointer transition-colors bg-black/30 backdrop-blur-sm border-white/20"
            onClick={() => navigate(`/sessions/${session._id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-background">
                  {session.name}
                </CardTitle>
                <Badge variant={STATUS_BADGE[session.status]}>
                  {session.status}
                </Badge>
              </div>
              <CardDescription className="text-background">
                {session.playerSlots.length} players ·{' '}
                {new Date(session.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
