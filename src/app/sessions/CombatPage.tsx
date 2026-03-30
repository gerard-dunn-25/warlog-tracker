// src/app/sessions/CombatPage.tsx
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Id } from '../../../convex/_generated/dataModel'
import type { SessionWarrior } from '@/types'
import { calculateCombat } from '@/lib/rules/combat'

// ── Helpers ───────────────────────────────────────────────────────

function d6Prob(target: number): number {
  return Math.max(0, Math.min(1, (7 - target) / 6))
}

// ── Warrior Selector ──────────────────────────────────────────────

function WarriorSelect({
  label,
  warriors,
  value,
  onChange,
}: {
  label: string
  warriors: SessionWarrior[]
  value: Id<'sessionWarriors'> | ''
  onChange: (id: Id<'sessionWarriors'> | '') => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-semibold">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Id<'sessionWarriors'> | '')}
        className="flex h-9 w-full rounded-md border border-input bg-zinc-900 px-3 py-1 text-sm shadow-sm text-background"
      >
        <option value="">Select warrior...</option>
        {warriors.map((w) => (
          <option key={w._id} value={w._id}>
            {w.name} ({w.type})
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Combat Result ─────────────────────────────────────────────────

function CombatResult({
  attacker,
  defender,
}: {
  attacker: SessionWarrior
  defender: SessionWarrior
}) {
  const combat = calculateCombat(attacker, defender)
  const { result } = combat.aAttacksB
  const { toHit, toWound, armourSave, effectiveStrength, equipmentNotes } =
    result

  const hitChance = d6Prob(toHit)
  const woundChance = d6Prob(toWound)
  const saveChance = armourSave ? d6Prob(armourSave) : 0
  const woundPerAttack = hitChance * woundChance * (1 - saveChance)

  return (
    <div className="flex flex-col gap-3">
      {combat.aAttacksB.strikesFirst && (
        <Badge variant="default" className="w-fit">
          Strikes First
        </Badge>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="flex flex-col rounded-md p-2 bg-black/30 backdrop-blur-sm border-white/20">
          <span className="text-xs text-muted-foreground">To Hit</span>
          <span className="font-semibold text-background">{toHit}+</span>
          <span className="text-xs text-muted-foreground">
            {(hitChance * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex flex-col rounded-md p-2 bg-black/30 backdrop-blur-sm border-white/20">
          <span className="text-xs text-muted-foreground">To Wound</span>
          <span className="font-semibold text-background">{toWound}+</span>
          <span className="text-xs text-muted-foreground">
            {(woundChance * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex flex-col rounded-md p-2 bg-black/30 backdrop-blur-sm border-white/20">
          <span className="text-xs text-muted-foreground">Armour Save</span>
          <span className="font-semibold text-background">
            {armourSave ? `${armourSave}+` : '—'}
          </span>
          <span className="text-xs text-muted-foreground">
            {armourSave ? `${(saveChance * 100).toFixed(0)}%` : '—'}
          </span>
        </div>
      </div>

      {effectiveStrength !== attacker.stats.strength && (
        <p className="text-xs text-muted-foreground ">
          Effective S{effectiveStrength} (base S{attacker.stats.strength} +
          weapon bonus)
        </p>
      )}

      <div className="rounded-md border p-3 text-center bg-black/30 backdrop-blur-sm border-white/20">
        <p className="text-xs text-muted-foreground">Wound per attack</p>
        <p className="text-2xl font-bold text-background">
          {(woundPerAttack * 100).toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground">
          {attacker.stats.attacks > 1
            ? `${attacker.stats.attacks} attacks — expected ${(
                woundPerAttack * attacker.stats.attacks
              ).toFixed(2)} wounds`
            : '1 attack'}
        </p>
      </div>

      {equipmentNotes.length > 0 && (
        <div className="flex flex-col gap-1">
          {equipmentNotes.map((note, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              {note}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Combat Page ───────────────────────────────────────────────────

export default function CombatPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const session = useQuery(
    api.sessions.get,
    sessionId ? { sessionId: sessionId as Id<'sessions'> } : 'skip',
  )
  const allWarriors = useQuery(
    api.sessionwarriors.listBySession,
    sessionId ? { sessionId: sessionId as Id<'sessions'> } : 'skip',
  )

  const [attackerId, setAttackerId] = useState<Id<'sessionWarriors'> | ''>('')
  const [defenderId, setDefenderId] = useState<Id<'sessionWarriors'> | ''>('')

  if (session === undefined || allWarriors === undefined) {
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

  const activeWarriors = (allWarriors as SessionWarrior[]).filter(
    (w) => w.isActive,
  )
  const attacker = activeWarriors.find((w) => w._id === attackerId)
  const defender = activeWarriors.find((w) => w._id === defenderId)

  function swap() {
    const prev = attackerId
    setAttackerId(defenderId)
    setDefenderId(prev)
  }

  const initiativeNote =
    attacker && defender
      ? calculateCombat(attacker, defender).initiativeNote
      : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/sessions/${sessionId}`)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-background tracking-tight">
            Combat
          </h1>
          <p className="text-background">{session.name}</p>
        </div>
      </div>

      {activeWarriors.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">No active warriors.</p>
          <p className="text-sm text-muted-foreground">
            Set up rosters before entering combat.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(`/sessions/${sessionId}`)}
          >
            Back to Session
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="bg-black/30 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-background">
                Select Combatants
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-background">
              <WarriorSelect
                label="Attacker"
                warriors={activeWarriors.filter((w) => w._id !== defenderId)}
                value={attackerId}
                onChange={setAttackerId}
              />
              <div className="flex justify-center">
                <Button
                  className="flex flex-col gap-4 text-background"
                  variant="default"
                  size="icon"
                  onClick={swap}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
              <WarriorSelect
                label="Defender"
                warriors={activeWarriors.filter((w) => w._id !== attackerId)}
                value={defenderId}
                onChange={setDefenderId}
              />
              {initiativeNote && (
                <p className="text-center text-xs text-muted-foreground">
                  {initiativeNote}
                </p>
              )}
            </CardContent>
          </Card>

          {attacker && defender && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-black/30 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2 ">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-background">
                      {attacker.name} → {defender.name}
                    </CardTitle>
                    <Badge variant="default">
                      S{attacker.stats.strength} vs T{defender.stats.toughness}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CombatResult attacker={attacker} defender={defender} />
                </CardContent>
              </Card>
              <Card className="bg-black/30 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between ">
                    <CardTitle className="text-base text-background">
                      {defender.name} → {attacker.name}
                    </CardTitle>
                    <Badge variant="default">
                      S{defender.stats.strength} vs T{attacker.stats.toughness}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CombatResult attacker={defender} defender={attacker} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
