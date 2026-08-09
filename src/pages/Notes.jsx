import { useState, useMemo } from 'react'
import { Plus, Pin, Search, Trash2, X } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Modal from '../components/ui/Modal.jsx'
import { PageLoader } from '../components/ui/Loading.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import RichTextEditor from '../components/notes/RichTextEditor.jsx'
import { useUserCollection } from '../hooks/useUserCollection.js'
import { useGamification } from '../hooks/useGamification.js'

const emptyForm = { title: '', course: '', content: '', pinned: false }

function stripHtml(html) {
  const div = document.createElement('div')
  div.innerHTML = html || ''
  return div.textContent || ''
}

export default function Notes() {
  const { items: notes, loading, addItem, updateItem, removeItem } = useUserCollection('notes', {
    orderByField: 'updatedAt',
    direction: 'desc'
  })
  const { awardXp } = useGamification()
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return notes
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.course?.toLowerCase().includes(q) ||
        stripHtml(n.content).toLowerCase().includes(q)
    )
  }, [notes, query])

  const pinned = filtered.filter((n) => n.pinned)
  const rest = filtered.filter((n) => !n.pinned)

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (note) => {
    setEditingId(note.id)
    setForm({ title: note.title, course: note.course || '', content: note.content || '', pinned: !!note.pinned })
    setModalOpen(true)
  }

  const togglePin = (note) => updateItem(note.id, { pinned: !note.pinned })
  const deleteNote = (id) => removeItem(id)

  const saveNote = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateItem(editingId, { ...form })
      } else {
        await addItem({ ...form })
        awardXp('noteCreated')
      }
      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader label="Loading your notes…" />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notes"
        subtitle={`${notes.length} note${notes.length === 1 ? '' : 's'}`}
        action={
          <Button onClick={openNew}>
            <Plus size={18} /> <span className="hidden sm:inline">New note</span>
          </Button>
        }
      />

      <div className="mb-6 max-w-md">
        <Input icon={Search} placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {pinned.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
            <Pin size={14} /> Pinned
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinned.map((note, i) => (
              <NoteCard note={note} key={note.id} delay={i * 50} onOpen={() => openEdit(note)} onPin={() => togglePin(note)} onDelete={() => deleteNote(note.id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        {pinned.length > 0 && <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">All notes</h3>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((note, i) => (
            <NoteCard note={note} key={note.id} delay={i * 50} onOpen={() => openEdit(note)} onPin={() => togglePin(note)} onDelete={() => deleteNote(note.id)} />
          ))}
        </div>
        {filtered.length === 0 && notes.length > 0 && (
          <Card className="p-10 text-center text-[var(--text-secondary)] col-span-full">
            <p className="font-medium text-[var(--text-primary)]">No notes match "{query}"</p>
          </Card>
        )}
        {notes.length === 0 && (
          <Card className="p-10 text-center text-[var(--text-secondary)] col-span-full">
            <p className="font-medium text-[var(--text-primary)]">No notes yet</p>
            <p className="text-sm mt-1">Create your first note to get started.</p>
          </Card>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit note' : 'New note'}
        className="sm:max-w-2xl"
        footer={
          <>
            {editingId && (
              <Button
                variant="ghost"
                className="!text-danger mr-auto"
                onClick={() => {
                  deleteNote(editingId)
                  setModalOpen(false)
                }}
              >
                <Trash2 size={16} /> Delete
              </Button>
            )}
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={saveNote} disabled={saving || !form.title.trim()}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create note'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="e.g. Eigenvalues & Eigenvectors"
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
            <label className="text-sm font-medium mb-1.5 block">Content</label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Write your note… use the toolbar for bold, italic, underline, and lists."
            />
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, pinned: !f.pinned }))}
            className="flex items-center gap-2 text-sm font-medium w-fit"
          >
            <Pin size={16} className={form.pinned ? 'text-signal-600' : 'text-[var(--text-secondary)]'} fill={form.pinned ? 'currentColor' : 'none'} />
            {form.pinned ? 'Pinned to top' : 'Pin this note'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function NoteCard({ note, delay, onOpen, onPin, onDelete }) {
  const preview = stripHtml(note.content)
  return (
    <Card className="p-4 flex flex-col gap-2 animate-slide-up group relative" style={{ animationDelay: `${delay}ms` }}>
      <button className="text-left flex-1" onClick={onOpen}>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-snug pr-6">{note.title}</h4>
        </div>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mt-1 min-h-[3em]">{preview || 'No content yet'}</p>
      </button>
      <div className="flex items-center justify-between mt-1">
        {note.course ? <Badge tone="blue">{note.course}</Badge> : <span />}
        <span className="text-[11px] text-[var(--text-secondary)]">
          {note.updatedAt?.toDate ? note.updatedAt.toDate().toLocaleDateString() : ''}
        </span>
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPin()
          }}
          aria-label="Pin note"
          className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-2)]"
        >
          <Pin size={14} className={note.pinned ? 'text-signal-600' : 'text-[var(--text-secondary)]'} fill={note.pinned ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="Delete note"
          className="p-1.5 rounded-lg hover:bg-danger/10 text-[var(--text-secondary)] hover:text-danger"
        >
          <X size={14} />
        </button>
      </div>
    </Card>
  )
}
