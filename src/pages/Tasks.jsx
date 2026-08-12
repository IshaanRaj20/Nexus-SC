import { useState, useMemo } from 'react'
import { Plus, CheckCircle2, Circle, Clock, ListChecks, Trash2, Pencil } from 'lucide-react'
import clsx from 'clsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Modal from '../components/ui/Modal.jsx'
import { PageLoader } from '../components/ui/Loading.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useUserCollection } from '../hooks/useUserCollection.js'
import { useGamification } from '../hooks/useGamification.js'

const priorityTone = { high: 'danger', medium: 'warning', low: 'blue' }
const filters = ['All', 'Active', 'Completed']

const emptyForm = { title: '', course: '', priority: 'medium', dueDate: '' }

function formatDue(dueDate) {
  if (!dueDate) return 'No due date'
  const d = new Date(dueDate)
  if (Number.isNaN(d.getTime())) return 'No due date'
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function Tasks() {
  const { items: tasks, loading, addItem, updateItem, removeItem } = useUserCollection('tasks', {
    orderByField: 'dueDate',
    direction: 'asc'
  })
  const { completeTask, recordAdd } = useGamification()
  const [filter, setFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'Active') return tasks.filter((t) => !t.done)
    if (filter === 'Completed') return tasks.filter((t) => t.done)
    return tasks
  }, [tasks, filter])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditingId(task.id)
    setForm({ title: task.title, course: task.course || '', priority: task.priority || 'medium', dueDate: task.dueDate || '' })
    setModalOpen(true)
  }

  const toggleTask = (task) => {
    const nowDone = !task.done
    updateItem(task.id, { done: nowDone })
    if (nowDone) completeTask(task.dueDate)
  }
  const deleteTask = (id) => removeItem(id)

  const saveTask = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateItem(editingId, { ...form })
      } else {
        await addItem({ ...form, done: false })
        recordAdd('taskAdded')
      }
      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader label="Loading your tasks…" />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.filter((t) => !t.done).length} tasks remaining`}
        action={
          <Button onClick={openNew}>
            <Plus size={18} /> <span className="hidden sm:inline">New task</span>
          </Button>
        }
      />

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-1.5 rounded-pill text-sm font-medium whitespace-nowrap transition-colors',
              filter === f
                ? 'bg-signal-600 text-white'
                : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-[var(--text-secondary)]">
            <ListChecks size={32} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium text-[var(--text-primary)]">Nothing here yet</p>
            <p className="text-sm mt-1">Add a task and it'll show up here in real time.</p>
          </Card>
        )}
        {filtered.map((task, i) => (
          <Card
            key={task.id}
            className="p-4 flex items-center gap-3 animate-slide-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <button
              onClick={() => toggleTask(task)}
              className={clsx('shrink-0 transition-colors', task.done ? 'text-success' : 'text-[var(--text-secondary)] hover:text-signal-600')}
              aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
            </button>

            <button className="min-w-0 flex-1 text-left" onClick={() => openEdit(task)}>
              <p className={clsx('text-sm font-medium truncate', task.done && 'line-through text-[var(--text-secondary)]')}>
                {task.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {task.course && <Badge tone="neutral">{task.course}</Badge>}
                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                  <Clock size={11} /> {formatDue(task.dueDate)}
                </span>
              </div>
            </button>

            <Badge tone={priorityTone[task.priority] || 'blue'} className="capitalize hidden sm:inline-flex shrink-0">
              {task.priority}
            </Badge>

            <button
              onClick={() => openEdit(task)}
              aria-label="Edit task"
              className="shrink-0 p-2 rounded-lg text-[var(--text-secondary)] hover:text-signal-600 hover:bg-signal-50 dark:hover:bg-signal-900/30 transition-colors"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              aria-label="Delete task"
              className="shrink-0 p-2 rounded-lg text-[var(--text-secondary)] hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 size={17} />
            </button>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit task' : 'New task'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={saveTask} disabled={saving || !form.title.trim()}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add task'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Task title"
            placeholder="e.g. Read chapter 7"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus
          />
          <Input
            label="Course"
            placeholder="e.g. MATH 221"
            value={form.course}
            onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
          />
          <div>
            <label className="text-sm font-medium mb-1.5 block">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, priority: p }))}
                  className={clsx(
                    'py-2 rounded-xl text-sm font-medium capitalize border transition-colors',
                    form.priority === p
                      ? 'border-signal-600 bg-signal-50 dark:bg-signal-900/30 text-signal-600'
                      : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)]'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Due date"
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  )
}
