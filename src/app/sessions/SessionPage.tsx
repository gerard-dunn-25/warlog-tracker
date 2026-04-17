// src/app/sessions/SessionPage.tsx
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import type { PlayerSlot, SessionWarrior } from '@/types'
import SessionWarriorEditDialog from '@/components/SessionWarriorEditDialog'

// ── Player Slot Card ──────────────────────────────────────────────

function PlayerSlotCard({
  slot,
  slotIndex,
  sessionId,
}: {
  slot: PlayerSlot
  slotIndex: number
  sessionId: Id<'sessions'>
}) {
  const warbands = useQuery(api.warbands.list)
  const assignWarband = useMutation(api.sessions.assignWarband)
  const updateLabel = useMutation(api.sessions.updateSlotLabel)
  const warriors = useQuery(
    api.sessionwarriors.listBySessionAndWarband,
    slot.warbandId ? { sessionId, warbandId: slot.warbandId } : 'skip',
  )

  const [editingLabel, setEditingLabel] = useState(false)
  const [labelValue, setLabelValue] = useState(slot.label)
  const [assigningWarband, setAssigningWarband] = useState(false)
  const [selectedWarbandId, setSelectedWarbandId] = useState<
    Id<'warbands'> | ''
  >(slot.warbandId ?? '')

  const activeWarriors = (warriors ?? []).filter((w) => w.isActive)
  const warband = warbands?.find((wb) => wb._id === slot.warbandId)

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedWarbandId) return
    await assignWarband({
      sessionId,
      slotIndex,
      warbandId: selectedWarbandId as Id<'warbands'>,
    })
    setAssigningWarband(false)
  }

  async function handleLabelSave() {
    if (labelValue.trim() === slot.label) return setEditingLabel(false)
    await updateLabel({ sessionId, slotIndex, label: labelValue.trim() })
    setEditingLabel(false)
  }

  return (
    <>
      <Card className="bg-black/30 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            {editingLabel ? (
              <Input
                autoFocus
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleLabelSave}
                onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
                className="h-7 w-36 text-sm font-semibold"
              />
            ) : (
              <CardTitle
                className="cursor-pointer text-base text-background hover:underline"
                onClick={() => setEditingLabel(true)}
              >
                {slot.label}
              </CardTitle>
            )}
            {slot.warbandId && (
              <Badge variant="default">{activeWarriors.length}</Badge>
            )}
          </div>
          {warband && <p className="text-sm text-background">{warband.name}</p>}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!slot.warbandId ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssigningWarband(true)}
            >
              Assign Warband
            </Button>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-background">Active warriors</span>
                <span className="text-background">{activeWarriors.length}</span>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => setAssigningWarband(true)}
              >
                Change Warband
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={assigningWarband} onOpenChange={setAssigningWarband}>
        <DialogContent className="bg-black/30 backdrop-blur-sm border-white/20">
          <DialogHeader>
            <DialogTitle className="text-background">
              Assign Warband to {slot.label}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="warband" className="text-background">
                Warband
              </Label>
              <select
                id="warband"
                value={selectedWarbandId}
                onChange={(e) =>
                  setSelectedWarbandId(e.target.value as Id<'warbands'>)
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-muted-foreground shadow-sm"
                required
              >
                <option value="">Select a warband...</option>
                {warbands?.map((wb) => (
                  <option key={wb._id} value={wb._id}>
                    {wb.name} ({wb.factionType})
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={!selectedWarbandId}>
              Assign
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Roster Manager ────────────────────────────────────────────────

function RosterManager({
  sessionId,
  slot,
  onClose,
}: {
  sessionId: Id<'sessions'>
  slot: PlayerSlot & { warbandId: Id<'warbands'> }
  slotIndex: number
  onClose: () => void
}) {
  const warriors = useQuery(api.sessionwarriors.listBySessionAndWarband, {
    sessionId,
    warbandId: slot.warbandId,
  })
  const setActive = useMutation(api.sessionwarriors.setActive)
  const [editingWarrior, setEditingWarrior] = useState<SessionWarrior | null>(
    null,
  )

  if (warriors === undefined) {
    return (
      <div className="flex justify-center py-8">
        <img
          src="/goblin-loading.gif"
          alt="Loading..."
          className="h-12 w-12 object-contain"
        />
      </div>
    )
  }

  const champions = warriors.filter((w) => w.role === 'champion')
  const followers = warriors.filter((w) => w.role === 'follower')

  function WarriorRow({ warrior }: { warrior: SessionWarrior }) {
    return (
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={warrior.isActive}
            onChange={(e) =>
              setActive({
                sessionWarriorId: warrior._id,
                isActive: e.target.checked,
              })
            }
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">{warrior.name}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingWarrior(warrior)}
          >
            Edit
          </Button>
          <span className="text-xs text-background">{warrior.type}</span>
        </div>
      </div>
    )
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Manage Roster — {slot.label}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        {champions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Champions</p>
            {champions.map((w) => (
              <WarriorRow key={w._id} warrior={w as SessionWarrior} />
            ))}
          </div>
        )}

        {followers.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Followers</p>
            {followers.map((w) => (
              <WarriorRow key={w._id} warrior={w as SessionWarrior} />
            ))}
          </div>
        )}

        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>

      <Dialog
        open={!!editingWarrior}
        onOpenChange={(open) => {
          if (!open) setEditingWarrior(null)
        }}
      >
        {editingWarrior && (
          <SessionWarriorEditDialog
            warrior={editingWarrior}
            onClose={() => setEditingWarrior(null)}
          />
        )}
      </Dialog>
    </DialogContent>
  )
}

// ── Session Page ──────────────────────────────────────────────────

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const session = useQuery(
    api.sessions.get,
    sessionId ? { sessionId: sessionId as Id<'sessions'> } : 'skip',
  )
  const updateStatus = useMutation(api.sessions.updateStatus)
  const [managingSlot, setManagingSlot] = useState<number | null>(null)

  if (session === undefined) {
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

  if (session === null) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">Session not found.</p>
        <Button variant="ghost" onClick={() => navigate('/sessions')}>
          Back to Sessions
        </Button>
      </div>
    )
  }

  const managingSlotData =
    managingSlot !== null ? session.playerSlots[managingSlot] : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sessions')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-background tracking-tight">
              {session.name}
            </h1>
            <p className="text-background capitalize">{session.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(`/sessions/${sessionId}/combat`)}>
            <Swords className="mr-2 h-4 w-4" />
            Combat
          </Button>
          {session.status !== 'ended' && (
            <Button
              variant="outline"
              onClick={() =>
                updateStatus({
                  sessionId: sessionId as Id<'sessions'>,
                  status: session.status === 'active' ? 'paused' : 'active',
                })
              }
            >
              {session.status === 'active' ? 'Pause' : 'Resume'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {session.playerSlots.map((slot, i) => (
          <div key={i} className="flex flex-col gap-2">
            <PlayerSlotCard
              slot={slot}
              slotIndex={i}
              sessionId={sessionId as Id<'sessions'>}
            />
            {slot.warbandId && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setManagingSlot(i)}
              >
                Manage Roster
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={managingSlot !== null}
        onOpenChange={(open) => !open && setManagingSlot(null)}
      >
        {managingSlotData?.warbandId && managingSlot !== null && (
          <RosterManager
            sessionId={sessionId as Id<'sessions'>}
            slot={
              managingSlotData as PlayerSlot & { warbandId: Id<'warbands'> }
            }
            slotIndex={managingSlot}
            onClose={() => setManagingSlot(null)}
          />
        )}
      </Dialog>
    </div>
  )
}
