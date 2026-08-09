import { useMemo } from 'react'
import { CalendarClock, CheckSquare, GraduationCap, CalendarX } from 'lucide-react'
import clsx from 'clsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { PageLoader } from '../components/ui/Loading.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useUserCollection } from '../hooks/useUserCollection.js'

function dateKey(d) {
  return d.toISOString().slice(0, 10)
}

function groupLabel(dateStr, todayKey, tomorrowKey) {
  if (dateStr === todayKey) return 'Today'
  if (dateStr === tomorrowKey) return 'Tomorrow'
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

// Calendar is built from your real Tasks (due dates) and Exams (dates) —
// there's no separate "events" collection to keep in sync, so anything you
// add on those pages shows up here automatically.
export default function CalendarPage() {
  const { items: tasks, loading: tasksLoading } = useUserCollection('tasks')
  const { items: exams, loading: examsLoading } = useUserCollection('exams')

  const grouped = useMemo(() => {
    const entries = []

    tasks.forEach((t) => {
      if (!t.dueDate) return
      const d = new Date(t.dueDate)
      if (Number.isNaN(d.getTime())) return
      entries.push({
        id: `task-${t.id}`,
        date: d,
        title: t.title,
        subtitle: t.course,
        type: 'task',
        done: t.done,
        time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      })
    })

    exams.forEach((x) => {
      if (!x.date) return
      const d = new Date(x.date)
      if (Number.isNaN(d.getTime())) return
      entries.push({
        id: `exam-${x.id}`,
        date: d,
        title: x.title,
        subtitle: x.course,
        type: 'exam',
        time: null
      })
    })

    entries.sort((a, b) => a.date - b.date)

    const today = new Date()
    const todayKey = dateKey(today)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowKey = dateKey(tomorrow)

    const byDay = new Map()
    entries.forEach((entry) => {
      const key = dateKey(entry.date)
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key).push(entry)
    })

    return Array.from(byDay.entries()).map(([key, items]) => ({
      key,
      label: groupLabel(key, todayKey, tomorrowKey),
      items
    }))
  }, [tasks, exams])

  if (tasksLoading || examsLoading) return <PageLoader label="Loading your calendar…" />

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <PageHeader title="Calendar" subtitle="Everything with a due date, in one timeline." />

      {grouped.length === 0 && (
        <Card className="p-10 text-center text-[var(--text-secondary)]">
          <CalendarX size={32} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-[var(--text-primary)]">Nothing scheduled</p>
          <p className="text-sm mt-1">Add a due date to a task or an exam date to see it here.</p>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        {grouped.map((group) => (
          <div key={group.key}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock size={15} className="text-signal-600" />
              <h3 className="font-display font-semibold text-sm">{group.label}</h3>
            </div>
            <div className="flex flex-col gap-2">
              {group.items.map((item) => (
                <Card key={item.id} className="p-3.5 flex items-center gap-3">
                  <div
                    className={clsx(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                      item.type === 'exam' ? 'bg-danger/10 text-danger' : 'bg-signal-100 dark:bg-signal-900/40 text-signal-600'
                    )}
                  >
                    {item.type === 'exam' ? <GraduationCap size={16} /> : <CheckSquare size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={clsx('text-sm font-medium truncate', item.done && 'line-through text-[var(--text-secondary)]')}>{item.title}</p>
                    {item.subtitle && <p className="text-xs text-[var(--text-secondary)]">{item.subtitle}</p>}
                  </div>
                  {item.time && <Badge tone="neutral">{item.time}</Badge>}
                  {item.type === 'exam' && <Badge tone="danger">Exam</Badge>}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
