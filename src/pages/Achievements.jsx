import { useMemo, useState } from 'react'
import * as Icons from 'lucide-react'
import clsx from 'clsx'
import Card from '../components/ui/Card.jsx'
import Badge, { ProgressBar } from '../components/ui/Badge.jsx'
import { PageLoader } from '../components/ui/Loading.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useGamification } from '../hooks/useGamification.js'
import { ACHIEVEMENT_DEFS } from '../data/achievementDefs.js'

const tierStyles = {
  bronze: { ring: 'ring-[#C48A4C]', bg: 'bg-[#C48A4C]/10', text: 'text-[#C48A4C]' },
  silver: { ring: 'ring-[#9AA5B1]', bg: 'bg-[#9AA5B1]/10', text: 'text-[#7A8494]' },
  gold: { ring: 'ring-[#F0A61F]', bg: 'bg-[#F0A61F]/10', text: 'text-[#F0A61F]' }
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'task', label: 'Tasks' },
  { id: 'note', label: 'Notes' },
  { id: 'exam', label: 'Exams' },
  { id: 'quiz', label: 'Quizzes' },
  { id: 'focus', label: 'Focus' },
  { id: 'streak', label: 'Streaks' },
  { id: 'level', label: 'Levels' }
]

function categoryOf(id) {
  return id.split('-')[0]
}

export default function Achievements() {
  const { data, levelInfo, loading } = useGamification()
  const [filter, setFilter] = useState('all')

  const achievements = useMemo(() => {
    const statValues = { ...data, level: levelInfo.level }
    return ACHIEVEMENT_DEFS.map((def) => {
      const value = statValues[def.metric] || 0
      return {
        ...def,
        unlocked: value >= def.threshold,
        progress: Math.min(100, Math.round((value / def.threshold) * 100)),
        value
      }
    })
  }, [data, levelInfo])

  const filtered = filter === 'all' ? achievements : achievements.filter((a) => categoryOf(a.id) === filter)
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  if (loading) return <PageLoader label="Loading your achievements…" />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Achievements" subtitle={`${unlockedCount} of ${achievements.length} badges unlocked`} />

      <Card className="p-5 mb-6 bg-gradient-to-br from-signal-600 to-signal-800 border-none text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-signal-100">Current level</p>
            <p className="font-display font-bold text-3xl">{levelInfo.level}</p>
          </div>
          <div className="flex-1 min-w-[160px] max-w-xs">
            <ProgressBar value={(levelInfo.currentLevelXp / levelInfo.xpForThisLevel) * 100} className="bg-white/20" />
            <p className="text-xs text-signal-100 mt-1.5">
              {levelInfo.currentLevelXp} / {levelInfo.xpForThisLevel} XP to next level · {levelInfo.totalXp.toLocaleString()} total
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Icons.Flame size={16} />
            {data.streakDays} day streak
          </div>
        </div>
      </Card>

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={clsx(
              'px-4 py-1.5 rounded-pill text-sm font-medium whitespace-nowrap transition-colors',
              filter === f.id
                ? 'bg-signal-600 text-white'
                : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((ach, i) => {
          const Icon = Icons[ach.icon] || Icons.Award
          const tier = tierStyles[ach.tier]
          return (
            <Card
              key={ach.id}
              className={clsx('p-4 flex flex-col items-center text-center gap-2 animate-slide-up', !ach.unlocked && 'opacity-70')}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div
                className={clsx(
                  'w-16 h-16 rounded-full flex items-center justify-center ring-2',
                  ach.unlocked ? tier.bg : 'bg-[var(--bg-surface-2)]',
                  ach.unlocked ? tier.ring : 'ring-[var(--border-subtle)]'
                )}
              >
                <Icon size={26} className={ach.unlocked ? tier.text : 'text-[var(--text-secondary)]'} />
              </div>
              <div>
                <p className="text-sm font-semibold">{ach.title}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{ach.description}</p>
              </div>
              {!ach.unlocked && (
                <div className="w-full mt-1">
                  <ProgressBar value={ach.progress} />
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {ach.value} / {ach.threshold}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
