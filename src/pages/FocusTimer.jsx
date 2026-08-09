import { useState, useEffect, useRef, useMemo } from 'react'
import { Play, Pause, RotateCcw, Coffee, BookOpen, Plus, Trash2, X } from 'lucide-react'
import clsx from 'clsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useUserCollection } from '../hooks/useUserCollection.js'
import { useGamification } from '../hooks/useGamification.js'

const BUILT_IN = [
  { id: 'built-focus', label: 'Focus', minutes: 25, color: '#155DFC', builtIn: true },
  { id: 'built-short', label: 'Short break', minutes: 5, color: '#1FAE6E', builtIn: true },
  { id: 'built-long', label: 'Long break', minutes: 15, color: '#F0A61F', builtIn: true }
]

const CUSTOM_COLORS = ['#8F5CFF', '#EF4444', '#FF8A2B', '#0EA5B7']

export default function FocusTimer() {
  const { items: customDurations, addItem, removeItem } = useUserCollection('focusDurations', {
    orderByField: 'createdAt',
    direction: 'asc'
  })
  const { awardXp } = useGamification()

  const durations = useMemo(
    () => [
      ...BUILT_IN,
      ...customDurations.map((d, i) => ({ ...d, color: CUSTOM_COLORS[i % CUSTOM_COLORS.length] }))
    ],
    [customDurations]
  )

  const [activeId, setActiveId] = useState('built-focus')
  const active = durations.find((d) => d.id === activeId) || durations[0]

  const [secondsLeft, setSecondsLeft] = useState(active.minutes * 60)
  const [running, setRunning] = useState(false)
  const [sessionsToday, setSessionsToday] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newMinutes, setNewMinutes] = useState('20')
  const intervalRef = useRef(null)

  // Reset the clock whenever the selected duration changes.
  useEffect(() => {
    setSecondsLeft(active.minutes * 60)
    setRunning(false)
  }, [active.id, active.minutes])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (active.id === 'built-focus' || (!active.builtIn && active.kind !== 'break')) {
              setSessionsToday((n) => n + 1)
              awardXp('focusSessionCompleted')
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, active])

  const reset = () => {
    setSecondsLeft(active.minutes * 60)
    setRunning(false)
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')
  const totalSeconds = active.minutes * 60
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0

  const radius = 120
  const circumference = 2 * Math.PI * radius

  const addCustomDuration = async () => {
    const minutes = Number(newMinutes)
    if (!newLabel.trim() || !minutes || minutes <= 0) return
    await addItem({ label: newLabel.trim(), minutes })
    setNewLabel('')
    setNewMinutes('20')
    setAddOpen(false)
  }

  const deleteCustomDuration = async (id) => {
    if (activeId === id) setActiveId('built-focus')
    await removeItem(id)
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <PageHeader title="Focus Timer" subtitle="Stay in the zone with focused study sprints." />

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {durations.map((d) => (
          <div key={d.id} className="relative group">
            <button
              onClick={() => setActiveId(d.id)}
              className={clsx(
                'px-4 py-2 rounded-pill text-sm font-medium transition-colors',
                activeId === d.id ? 'text-white' : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
              style={activeId === d.id ? { backgroundColor: d.color } : undefined}
            >
              {d.label} · {d.minutes}m
            </button>
            {!d.builtIn && (
              <button
                onClick={() => deleteCustomDuration(d.id)}
                aria-label={`Delete ${d.label}`}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setAddOpen(true)}
          className="px-3 py-2 rounded-pill text-sm font-medium bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-signal-600 transition-colors flex items-center gap-1"
        >
          <Plus size={15} /> Custom
        </button>
      </div>

      <Card className="p-8 sm:p-12 flex flex-col items-center gap-8">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r={radius} fill="none" stroke="var(--bg-surface-2)" strokeWidth="14" />
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke={active.color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-5xl tabular-nums">{mins}:{secs}</span>
            <span className="text-sm text-[var(--text-secondary)] mt-2 flex items-center gap-1.5">
              {active.id === 'built-short' || active.id === 'built-long' ? <Coffee size={15} /> : <BookOpen size={15} />}
              {active.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            aria-label="Reset timer"
            className="p-3 rounded-full bg-[var(--bg-surface-2)] hover:brightness-95 dark:hover:brightness-110 transition-all"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? 'Pause timer' : 'Start timer'}
            className="w-20 h-20 rounded-full flex items-center justify-center text-white transition-transform active:scale-95"
            style={{ backgroundColor: active.color }}
          >
            {running ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
          </button>
          <div className="w-12" />
        </div>
      </Card>

      <Card className="p-5 mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Sessions completed today</p>
          <p className="font-display font-bold text-2xl mt-0.5">{sessionsToday}</p>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={clsx('w-2.5 h-8 rounded-full', i < sessionsToday ? 'bg-signal-600' : 'bg-[var(--bg-surface-2)]')} />
          ))}
        </div>
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add custom duration"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addCustomDuration} disabled={!newLabel.trim() || !Number(newMinutes)}>
              Add duration
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Label" placeholder="e.g. Deep work" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} autoFocus />
          <Input label="Minutes" type="number" min="1" max="180" value={newMinutes} onChange={(e) => setNewMinutes(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}
