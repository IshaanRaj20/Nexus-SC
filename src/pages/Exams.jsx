import { useState } from 'react'
import { CalendarClock, Plus, Trash2, Pencil } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge, { ProgressBar } from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Modal from '../components/ui/Modal.jsx'
import { PageLoader } from '../components/ui/Loading.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useUserCollection } from '../hooks/useUserCollection.js'
import { useGamification } from '../hooks/useGamification.js'

const emptyForm = { title: '', course: '', date: '', topics: '', progress: 0 }

function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target - now) / (1000 * 60 * 60 * 24))
}

function urgencyTone(daysLeft) {
  if (daysLeft === null) return 'neutral'
  if (daysLeft <= 7) return 'danger'
  if (daysLeft <= 14) return 'warning'
  return 'blue'
}

export default function Exams() {
  const { items: exams, loading, addItem, updateItem, removeItem } = useUserCollection('exams', {
    orderByField: 'date',
    direction: 'asc'
  })
  const { awardXp } = useGamification()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (exam) => {
    setEditingId(exam.id)
    setForm({
      title: exam.title,
      course: exam.course || '',
      date: exam.date || '',
      topics: (exam.topics || []).join(', '),
      progress: exam.progress ?? 0
    })
    setModalOpen(true)
  }

  const saveExam = async () => {
    if (!form.title.trim() || !form.date) return
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        course: form.course,
        date: form.date,
        progress: Number(form.progress) || 0,
        topics: form.topics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      }
      if (editingId) {
        await updateItem(editingId, payload)
      } else {
        await addItem(payload)
        awardXp('examAdded')
      }
      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader label="Loading your exams…" />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Exams"
        subtitle={`${exams.length} upcoming exam${exams.length === 1 ? '' : 's'}`}
        action={
          <Button onClick={openNew}>
            <Plus size={18} /> <span className="hidden sm:inline">Add exam</span>
          </Button>
        }
      />

      {exams.length === 0 && (
        <Card className="p-10 text-center text-[var(--text-secondary)]">
          <CalendarClock size={32} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-[var(--text-primary)]">No exams added yet</p>
          <p className="text-sm mt-1">Add one to start tracking your prep.</p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {exams.map((exam, i) => {
          const daysLeft = daysUntil(exam.date)
          return (
            <Card key={exam.id} className="p-5 flex flex-col gap-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold text-base">{exam.title}</h3>
                  {exam.course && <p className="text-sm text-[var(--text-secondary)]">{exam.course}</p>}
                </div>
                <Badge tone={urgencyTone(daysLeft)}>
                  {daysLeft === null ? 'No date' : daysLeft < 0 ? 'Past' : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <CalendarClock size={16} />
                {exam.date ? new Date(exam.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'No date set'}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1.5">
                  <span>Preparation</span>
                  <span>{exam.progress ?? 0}%</span>
                </div>
                <ProgressBar
                  value={exam.progress ?? 0}
                  tone={(exam.progress ?? 0) >= 60 ? 'success' : (exam.progress ?? 0) >= 30 ? 'warning' : 'danger'}
                />
              </div>

              {exam.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {exam.topics.map((topic) => (
                    <Badge tone="neutral" key={topic}>{topic}</Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-1">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(exam)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant="secondary" size="sm" className="!px-3" onClick={() => removeItem(exam.id)} aria-label="Delete exam">
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit exam' : 'Add exam'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={saveExam} disabled={saving || !form.title.trim() || !form.date}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add exam'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Exam title" placeholder="e.g. Midterm Exam" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
          <Input label="Course" placeholder="e.g. MATH 221" value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <Input label="Topics" placeholder="Comma-separated, e.g. Vectors, Eigenvalues" value={form.topics} onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))} />
          <div>
            <label className="text-sm font-medium mb-1.5 block">Preparation: {form.progress}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))}
              className="w-full accent-signal-600"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
