import { useMemo } from 'react'
import { CheckCircle2, Circle, TrendingUp, Flame, ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card, { CardBody } from '../components/ui/Card.jsx'
import Badge, { ProgressBar } from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { PageLoader } from '../components/ui/Loading.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserCollection } from '../hooks/useUserCollection.js'
import { useGamification } from '../hooks/useGamification.js'

const priorityTone = { high: 'danger', medium: 'warning', low: 'blue' }

function stripHtml(html) {
  const div = document.createElement('div')
  div.innerHTML = html || ''
  return div.textContent || ''
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth()
  const { items: tasks, loading: tasksLoading, updateItem: updateTask } = useUserCollection('tasks', { orderByField: 'dueDate', direction: 'asc' })
  const { items: notes, loading: notesLoading } = useUserCollection('notes', { orderByField: 'updatedAt', direction: 'desc' })
  const { items: exams, loading: examsLoading } = useUserCollection('exams', { orderByField: 'date', direction: 'asc' })
  const { data: gamification, levelInfo, awardXp, loading: gamificationLoading } = useGamification()

  const firstName = (userProfile?.name || currentUser?.displayName || currentUser?.email || 'there').split(' ')[0]

  const upcomingTasks = useMemo(() => tasks.filter((t) => !t.done).slice(0, 4), [tasks])
  const recentNotes = useMemo(() => notes.slice(0, 3), [notes])
  const nextExam = useMemo(() => exams.find((x) => x.date && new Date(x.date) >= new Date()) || exams[0], [exams])

  const tasksDueToday = tasks.filter((t) => isToday(t.dueDate) && !t.done).length
  const completedThisWeek = tasks.filter((t) => t.done).length
  const totalThisWeek = tasks.length
  const weeklyPercent = totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0

  const xpPercent = Math.round((levelInfo.currentLevelXp / levelInfo.xpForThisLevel) * 100)

  const loading = tasksLoading || notesLoading || examsLoading || gamificationLoading
  if (loading) return <PageLoader label="Loading your dashboard…" />

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Welcome back, ${firstName} 👋`} subtitle="Here's what's on your plate today." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="p-4 sm:p-5 animate-slide-up">
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Tasks due today</p>
          <p className="font-display font-bold text-xl sm:text-2xl mt-1">{tasksDueToday}</p>
        </Card>
        <Card className="p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Notes created</p>
          <p className="font-display font-bold text-xl sm:text-2xl mt-1">{notes.length}</p>
        </Card>
        <Card className="p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Day streak</p>
          <p className="font-display font-bold text-xl sm:text-2xl mt-1">{gamification.streakDays}</p>
        </Card>
        <Card className="p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '180ms' }}>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Tasks completed</p>
          <p className="font-display font-bold text-xl sm:text-2xl mt-1">{completedThisWeek}</p>
          <div className="flex items-center gap-1 mt-1.5 text-xs">
            <TrendingUp size={13} className="text-success" />
            <span className="text-success">{weeklyPercent}% of all tasks</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between p-5 pb-3">
              <h3 className="font-display font-semibold text-base">Upcoming tasks</h3>
              <Link to="/tasks" className="text-sm text-signal-600 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <CardBody className="flex flex-col gap-2">
              {upcomingTasks.length === 0 && (
                <p className="text-sm text-[var(--text-secondary)] text-center py-6">No tasks yet — add one to get started.</p>
              )}
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors group">
                  <button
                    onClick={() => {
                      updateTask(task.id, { done: true })
                      awardXp('taskCompleted')
                    }}
                    className="shrink-0 text-[var(--text-secondary)] hover:text-signal-600 transition-colors"
                    aria-label="Mark complete"
                  >
                    <Circle size={20} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.course && <span className="text-xs text-[var(--text-secondary)]">{task.course}</span>}
                      {task.dueDate && (
                        <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                          <Clock size={11} /> {new Date(task.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge tone={priorityTone[task.priority] || 'blue'} className="capitalize shrink-0">
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '160ms' }}>
            <div className="p-5 pb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold text-base">Recent notes</h3>
              <Link to="/notes" className="text-sm text-signal-600 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <CardBody className="grid sm:grid-cols-3 gap-3">
              {recentNotes.length === 0 && (
                <p className="text-sm text-[var(--text-secondary)] text-center py-6 sm:col-span-3">No notes yet.</p>
              )}
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  to="/notes"
                  className="p-3 rounded-xl border border-[var(--border-subtle)] hover:border-signal-300 hover:bg-[var(--bg-surface-2)] transition-colors"
                >
                  <p className="text-sm font-medium truncate">{note.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{stripHtml(note.content) || 'No content yet'}</p>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <Card className="p-5 bg-gradient-to-br from-signal-600 to-signal-800 text-white border-none animate-slide-up" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-signal-100">Level {levelInfo.level}</p>
                <p className="font-display font-bold text-2xl">{levelInfo.totalXp.toLocaleString()} XP</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <Flame size={22} />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={xpPercent} className="bg-white/20" tone="blue" />
              <p className="text-xs text-signal-100 mt-1.5">
                {levelInfo.xpForThisLevel - levelInfo.currentLevelXp} XP to level {levelInfo.level + 1}
              </p>
            </div>
          </Card>

          {nextExam ? (
            <Card className="p-5 animate-slide-up" style={{ animationDelay: '140ms' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-base">Next exam</h3>
                {nextExam.date && (
                  <Badge tone="danger">
                    {Math.max(0, Math.round((new Date(nextExam.date) - new Date()) / 86400000))}d left
                  </Badge>
                )}
              </div>
              <p className="font-medium text-sm">{nextExam.title}</p>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                {nextExam.course ? `${nextExam.course} • ` : ''}
                {nextExam.date ? new Date(nextExam.date).toLocaleDateString() : 'No date set'}
              </p>
              <ProgressBar value={nextExam.progress ?? 0} tone="blue" />
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">{nextExam.progress ?? 0}% prepared</p>
              <Link to="/exams">
                <Button variant="secondary" size="sm" className="w-full mt-3">Study now</Button>
              </Link>
            </Card>
          ) : (
            <Card className="p-5 animate-slide-up text-center" style={{ animationDelay: '140ms' }}>
              <p className="text-sm text-[var(--text-secondary)] mb-3">No exams added yet.</p>
              <Link to="/exams">
                <Button variant="secondary" size="sm" className="w-full">Add an exam</Button>
              </Link>
            </Card>
          )}

          <Card className="p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={18} className="text-success" />
              <h3 className="font-display font-semibold text-base">Task progress</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              {completedThisWeek} of {totalThisWeek} tasks completed
            </p>
            <ProgressBar value={weeklyPercent} tone="success" />
          </Card>
        </div>
      </div>
    </div>
  )
}
