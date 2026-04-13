import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Trash2, ChevronLeft } from 'lucide-react'
import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import type { Id } from '../../../convex/_generated/dataModel'

import CreateWarriorDialog from './CreateWarriorDialog'
import WarriorEditDialog from '@/components/WarriorEditDialog'
import type { Warrior } from '@/types'

// CreateWarriorDialog moved to its own module: ./CreateWarriorDialog

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
  const updateWarrior = useMutation(api.warriors.update)
  const [addingWarrior, setAddingWarrior] = useState(false)
  const [editingWarrior, setEditingWarrior] = useState<Warrior | null>(null)

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

      <Dialog
        open={!!editingWarrior}
        onOpenChange={(open) => {
          if (!open) setEditingWarrior(null)
        }}
      >
        {editingWarrior && (
          <WarriorEditDialog
            warrior={editingWarrior}
            onClose={() => setEditingWarrior(null)}
            onSave={async (data) => {
              await updateWarrior({ warriorId: editingWarrior._id, ...data })
            }}
          />
        )}
      </Dialog>

      {warriors.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-background">No warriors yet.</p>
          <p className="text-sm text-background">
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
                        onClick={() => setEditingWarrior(warrior)}
                      >
                        <Edit className="h-4 w-4 text-amber-400" />
                      </Button>
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
                        onClick={() => setEditingWarrior(warrior)}
                      >
                        <Edit className="h-4 w-4 text-amber-400" />
                      </Button>
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
