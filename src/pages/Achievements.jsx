import { useMemo, useState } from 'react'
import * as Icons from 'lucide-react'
import clsx from 'clsx'
import Card from '../components/ui/Card.jsx'
import { ProgressBar } from '../components/ui/Badge.jsx'
import { PageLoader } from '../components/ui/Loading.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useGamification } from '../hooks/useGamification.js'
import { useAchievements } from '../hooks/useAchievements.js'
import { CATEGORY_META } from '../data/achievementDefs.js'

const tierStyles = {
  bronze: { ring: 'ring-[#C48A4C]', bg: 'bg-[#C48A4C]/10', text: 'text-[#C48A4C]' },
  silver: { ring: 'ring-[#9AA5B1]', bg: 'bg-[#9AA5B1]/10', text: 'text-[#7A8494]' },
  gold: { ring: 'ring-[#F0A61F]', bg: 'bg-[#F0A61F]/10', text: 'text-[#F0A61F]' }
}

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unlocked', label: 'Unlocked' },
  { id: 'locked', label: 'Locked' }
]

function formatUnlockDate(unlockedAt) {
  if (!unlockedAt?.toDate) return ''
  return unlockedAt.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function Achievements() {
  const { levelInfo } = useGamification()
  const { achievements, loading } = useAchievements()
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = useMemo(() => {
    return achievements.filter((a) => {
      if (statusFilter === 'unlocked' && !a.unlocked) return false
      if (statusFilter === 'locked' && a.unlocked) return false
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false
      return true
    })
  }, [achievements, statusFilter, categoryFilter])

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const categories = Object.keys(CATEGORY_META)

  if (loading) return <PageLoader label="Loading your achievements…" />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Achievements" subtitle={`${unlockedCount} of ${achievements.length} unlocked`} />

      <Card className="p-5 mb-6 bg-gradient-to-br from-signal-600 to-signal-800 border-none text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-signal-100">Current level</p>
            <p className="font-display font-bold text-3xl">{levelInfo.level}</p>
          </div>
          <div className="flex-1 min-w-[160px] max-w-xs">
            <ProgressBar value={(levelInfo.currentLevelXp / levelInfo.xpForThisLevel) * 100} className="bg-white/20" />
            <p className="text-xs text-signal-100 mt-1.5">
              {levelInfo.currentLevelXp} / {levelInfo.xpForThisLevel} XP to next level
            </p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={clsx(
              'px-4 py-1.5 rounded-pill text-sm font-medium whitespace-nowrap transition-colors',
              statusFilter === f.id
                ? 'bg-signal-600 text-white'
                : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCategoryFilter('all')}
          className={clsx(
            'px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap transition-colors',
            categoryFilter === 'all'
              ? 'bg-[var(--text-primary)] text-[var(--bg-app)]'
              : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
        >
          All categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={clsx(
              'px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap transition-colors',
              categoryFilter === cat
                ? 'bg-[var(--text-primary)] text-[var(--bg-app)]'
                : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-10 text-center text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">No achievements match this filter</p>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((ach, i) => {
          const isSecretLocked = ach.secret && !ach.unlocked
          const Icon = isSecretLocked ? Icons.Lock : Icons[ach.icon] || Icons.Award
          const tier = tierStyles[ach.tier]

          return (
            <Card
              key={ach.id}
              className={clsx('p-4 flex flex-col items-center text-center gap-2 animate-slide-up', !ach.unlocked && 'opacity-70')}
              style={{ animationDelay: `${i * 25}ms` }}
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

              {isSecretLocked ? (
                <div>
                  <p className="text-sm font-semibold">Secret Achievement</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Keep using Nexus to discover this achievement.</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold">{ach.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{ach.description}</p>
                </div>
              )}

              {ach.unlocked && ach.unlockedAt && (
                <p className="text-[11px] text-success font-medium mt-1">Unlocked {formatUnlockDate(ach.unlockedAt)}</p>
              )}

              {!ach.unlocked && !isSecretLocked && (
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
