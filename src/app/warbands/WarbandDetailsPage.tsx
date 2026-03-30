import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Trash2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Id } from '../../../convex/_generated/dataModel'

const DEFAULT_STATS = {
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

const STAT_LABELS: Record<string, string> = {
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

function CreateWarriorDialog({
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
  const [stats, setStats] = useState(DEFAULT_STATS)

  function handleStatChange(stat: string, value: string) {
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
            placeholder="Sigrid"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Captain"
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
            {Object.entries(STAT_LABELS).map(([key, label]) => (
              <div key={key} className="flex flex-col gap-1">
                <Label htmlFor={key} className="text-xs text-muted-foreground">
                  {label}
                </Label>
                <Input
                  id={key}
                  type="number"
                  value={stats[key as keyof typeof stats]}
                  onChange={(e) => handleStatChange(key, e.target.value)}
                  min={0}
                  max={10}
                />
              </div>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={!name || !type}>
          Add Warrior
        </Button>
      </form>
    </DialogContent>
  )
}

export default function WarbandDetailPage() {
  const { warbandId } = useParams<{ warbandId: string }>()
  const navigate = useNavigate()
  const warband = useQuery(
    api.warbands.get,
    warbandId ? { warbandId: warbandId as Id<'warbands'> } : 'skip',
  )
  const warriors = useQuery(
    api.warriors.listByWarband,
    warbandId ? { warbandId: warbandId as Id<'warbands'> } : 'skip',
  )
  const removeWarrior = useMutation(api.warriors.remove)
  const [addingWarrior, setAddingWarrior] = useState(false)

  if (warband === undefined || warriors === undefined) {
    return (
      <div className="flex justify-center py-12">
        <img
          src="/goblin-loading.gif"
          alt="Loading..."
          className="h-16 w-16 object-contain"
        />
      </div>
    )
  }

  if (warband === null) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">Warband not found.</p>
        <Button variant="ghost" onClick={() => navigate('/warbands')}>
          Back to Warbands
        </Button>
      </div>
    )
  }

  const champions = warriors.filter((w) => w.role === 'champion')
  const followers = warriors.filter((w) => w.role === 'follower')
  const totalCost = warriors.reduce((sum, w) => sum + w.coinValue, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/warbands')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-background">
              {warband.name}
            </h1>
            <p className="text-background">{warband.factionType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{totalCost} coin</Badge>
          <Button onClick={() => setAddingWarrior(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warrior
          </Button>
        </div>
      </div>

      <Dialog open={addingWarrior} onOpenChange={setAddingWarrior}>
        <CreateWarriorDialog
          warbandId={warbandId as Id<'warbands'>}
          onClose={() => setAddingWarrior(false)}
        />
      </Dialog>

      {warriors.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">No warriors yet.</p>
          <p className="text-sm text-muted-foreground">
            Add your first warrior to get started.
          </p>
        </div>
      )}

      {champions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold tracking-tight text-background">
            Champions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {champions.map((warrior) => (
              <Card
                key={warrior._id}
                className="bg-black/30 backdrop-blur-sm border-white/20"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-background">
                        {warrior.name}
                      </CardTitle>
                      <CardDescription className="text-background">
                        {warrior.type}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{warrior.coinValue} coin</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeWarrior({ warriorId: warrior._id })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-9 gap-1 text-center">
                    {Object.entries(STAT_LABELS).map(([key, label]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {label}
                        </span>
                        <span className="text-sm font-medium text-background">
                          {warrior.stats[key as keyof typeof warrior.stats]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {followers.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold tracking-tight text-background">
            Followers
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {followers.map((warrior) => (
              <Card
                key={warrior._id}
                className="bg-black/30 backdrop-blur-sm border-white/20"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-background">
                        {warrior.name}
                      </CardTitle>
                      <CardDescription className="text-background">
                        {warrior.type}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{warrior.coinValue} coin</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeWarrior({ warriorId: warrior._id })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-9 gap-1 text-center">
                    {Object.entries(STAT_LABELS).map(([key, label]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {label}
                        </span>
                        <span className="text-sm font-medium text-background">
                          {warrior.stats[key as keyof typeof warrior.stats]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
