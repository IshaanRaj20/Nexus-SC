import { useState } from 'react'
import { Brain, Play, Plus, Trash2, Sparkles, CheckCircle2, XCircle, ArrowLeft, Info } from 'lucide-react'
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
import { generateQuizWithGemini } from '../lib/gemini.js'

const emptyQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0
})

const emptyForm = {
  title: '',
  course: '',
  questions: [emptyQuestion()]
}

export default function Quizzes() {
  const { items: quizzes, loading, addItem, updateItem, removeItem } = useUserCollection('quizzes', {
    orderByField: 'createdAt',
    direction: 'desc'
  })

  const { awardXp, recordAdd } = useGamification()

  const [modalOpen, setModalOpen] = useState(false)
  const [aiInfoOpen, setAiInfoOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState(null)

  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState(null)

  const { items: notes } = useUserCollection('notes')
  const { items: exams } = useUserCollection('exams')

  const openNew = () => {
    setForm(emptyForm)
    setModalOpen(true)
  }

  const updateQuestion = (idx, patch) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === idx ? { ...q, ...patch } : q
      )
    }))
  }

  const updateOption = (qIdx, optIdx, value) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((o, oi) =>
                oi === optIdx ? value : o
              )
            }
          : q
      )
    }))
  }

  const generateWithAI = async () => {
    setAiGenerating(true)
    setAiError(null)

    try {
      const noteText = notes
        .slice(0, 5)
        .map(
          (n) =>
            `${n.title}: ${n.content?.replace(/<[^>]+>/g, ' ')}`
        )
        .join('\n\n')

      const examText = exams
        .map(
          (x) =>
            `${x.title} (${x.course}): ${(x.topics || []).join(', ')}`
        )
        .join('\n')

      const sourceText =
        `${noteText}\n\n${examText}`.trim() ||
        'General study topics.'

      const questions = await generateQuizWithGemini({
        sourceText,
        questionCount: 5
      })

      await addItem({
        title: 'AI-generated quiz',
        course: exams[0]?.course || '',
        questions,
        bestScore: null,
        attempts: 0
      })
      recordAdd('quizCreated')

      setAiInfoOpen(false)
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiGenerating(false)
    }
  }

  const addQuestion = () => {
    setForm((f) => ({
      ...f,
      questions: [...f.questions, emptyQuestion()]
    }))
  }

  const removeQuestion = (idx) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.filter((_, i) => i !== idx)
    }))
  }

  const canSave =
    form.title.trim() &&
    form.questions.length > 0 &&
    form.questions.every(
      (q) =>
        q.question.trim() &&
        q.options.every((o) => o.trim())
    )

  const saveQuiz = async () => {
    if (!canSave) return

    setSaving(true)

    try {
      await addItem({
        title: form.title,
        course: form.course,
        questions: form.questions,
        bestScore: null,
        attempts: 0
      })
      recordAdd('quizCreated')

      setModalOpen(false)
      setForm(emptyForm)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoader label="Loading your quizzes…" />
  }

  if (activeQuiz) {
    return (
      <QuizRunner
        quiz={activeQuiz}
        onExit={() => setActiveQuiz(null)}
        onFinish={updateItem}
        awardXp={awardXp}
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Quizzes"
        subtitle="Test your knowledge and track your improvement."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setAiInfoOpen(true)}
            >
              <Sparkles size={18} />
              <span className="hidden sm:inline">
                Generate with AI
              </span>
            </Button>

            <Button onClick={openNew}>
              <Plus size={18} />
              <span className="hidden sm:inline">
                New quiz
              </span>
            </Button>
          </div>
        }
      />

      {quizzes.length === 0 && (
        <Card className="p-10 text-center text-[var(--text-secondary)]">
          <Brain
            size={32}
            className="mx-auto mb-3 opacity-50"
          />

          <p className="font-medium text-[var(--text-primary)]">
            No quizzes yet
          </p>

          <p className="text-sm mt-1">
            Create one manually, or set up AI generation.
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz, i) => (
          <Card
            key={quiz.id}
            className="p-5 flex flex-col gap-3 animate-slide-up"
            style={{
              animationDelay: `${i * 50}ms`
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-signal-100 dark:bg-signal-900/40 flex items-center justify-center shrink-0">
                <Brain
                  size={18}
                  className="text-signal-600"
                />
              </div>

              <button
                onClick={() => removeItem(quiz.id)}
                aria-label="Delete quiz"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm leading-snug">
                {quiz.title}
              </h3>

              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {quiz.course
                  ? `${quiz.course} • `
                  : ''}
                {quiz.questions?.length || 0} questions
              </p>
            </div>

            {quiz.bestScore !== null &&
            quiz.bestScore !== undefined ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">
                  Best score
                </span>

                <span className="font-semibold text-success">
                  {quiz.bestScore}%
                </span>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] italic">
                Not attempted yet
              </p>
            )}

            <Button
              size="sm"
              className="mt-1"
              onClick={() => setActiveQuiz(quiz)}
              disabled={!quiz.questions?.length}
            >
              <Play size={14} />
              {quiz.attempts > 0 ? 'Retake' : 'Start'}
            </Button>
          </Card>
        ))}
      </div>

      {/* Create Quiz Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New quiz"
        className="sm:max-w-2xl"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={saveQuiz}
              disabled={saving || !canSave}
            >
              {saving ? 'Saving…' : 'Create quiz'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Quiz title"
            placeholder="e.g. Vector Spaces Fundamentals"
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                title: e.target.value
              }))
            }
            autoFocus
          />

          <Input
            label="Course"
            placeholder="e.g. MATH 221"
            value={form.course}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                course: e.target.value
              }))
            }
          />

          <div className="flex flex-col gap-4">
            {form.questions.map((q, qIdx) => (
              <Card
                key={qIdx}
                className="p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    Question {qIdx + 1}
                  </span>

                  {form.questions.length > 1 && (
                    <button
                      onClick={() =>
                        removeQuestion(qIdx)
                      }
                      aria-label="Remove question"
                      className="text-[var(--text-secondary)] hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <Input
                  placeholder="Question text"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(qIdx, {
                      question: e.target.value
                    })
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={
                          q.correctIndex === optIdx
                        }
                        onChange={() =>
                          updateQuestion(qIdx, {
                            correctIndex: optIdx
                          })
                        }
                        className="accent-signal-600"
                      />

                      <input
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) =>
                          updateOption(
                            qIdx,
                            optIdx,
                            e.target.value
                          )
                        }
                        className="flex-1 bg-[var(--bg-surface-2)] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-signal-600/20"
                      />
                    </label>
                  ))}
                </div>

                <p className="text-[11px] text-[var(--text-secondary)]">
                  Select the radio next to the correct answer.
                </p>
              </Card>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={addQuestion}
            className="self-start"
          >
            <Plus size={15} />
            Add question
          </Button>
        </div>
      </Modal>

      {/* AI Quiz Modal */}
      <Modal
        open={aiInfoOpen}
        onClose={() => {
          setAiInfoOpen(false)
          setAiError(null)
        }}
        title="Generate quiz with AI"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setAiInfoOpen(false)
                setAiError(null)
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={generateWithAI}
              disabled={aiGenerating}
            >
              {aiGenerating
                ? 'Generating…'
                : 'Generate 5 questions'}
            </Button>
          </>
        }
      >
        <div className="flex gap-3">
          <Info
            size={20}
            className="text-signal-600 shrink-0 mt-0.5"
          />

          <div className="text-sm text-[var(--text-secondary)] flex flex-col gap-2">
            <p>
              Uses your recent Notes and upcoming Exams
              to build a quiz automatically.
            </p>

            <p>
              Generating quizzes from your Notes and
              upcoming Exams requires connecting an AI
              provider through a backend function.
            </p>

            <p>
              Once configured, this button sends your
              notes and exam topics to the AI provider,
              generates questions, and saves the result
              as a normal quiz.
            </p>

            {aiError && (
              <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">
                {aiError}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

function QuizRunner({
  quiz,
  onExit,
  onFinish,
  awardXp
}) {
  const [answers, setAnswers] = useState(
    Array(quiz.questions.length).fill(null)
  )

  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  const submit = async () => {
    const computedScore = Math.round(
      (answers.filter(
        (a, i) => a === quiz.questions[i].correctIndex
      ).length /
        quiz.questions.length) *
        100
    )

    setScore(computedScore)
    setSubmitted(true)

    const newBest =
      quiz.bestScore === null ||
      quiz.bestScore === undefined
        ? computedScore
        : Math.max(quiz.bestScore, computedScore)

    await onFinish(quiz.id, {
      bestScore: newBest,
      attempts: (quiz.attempts || 0) + 1
    })

    awardXp('quizTaken', {
      perfect: computedScore === 100
    })
  }

  const allAnswered = answers.every(
    (a) => a !== null
  )

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
      >
        <ArrowLeft size={16} />
        Back to quizzes
      </button>

      <h1 className="font-display font-bold text-2xl mb-1">
        {quiz.title}
      </h1>

      {quiz.course && (
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {quiz.course}
        </p>
      )}

      {submitted && (
        <Card className="p-5 mb-6 flex items-center justify-between bg-gradient-to-br from-signal-600 to-signal-800 text-white border-none">
          <div>
            <p className="text-sm text-signal-100">
              Your score
            </p>

            <p className="font-display font-bold text-3xl">
              {score}%
            </p>
          </div>

          {score >= 70 ? (
            <CheckCircle2 size={32} />
          ) : (
            <XCircle size={32} />
          )}
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {quiz.questions.map((q, qIdx) => (
          <Card key={qIdx} className="p-5">
            <p className="text-sm font-medium mb-3">
              {qIdx + 1}. {q.question}
            </p>

            <div className="flex flex-col gap-2">
              {q.options.map((opt, optIdx) => {
                const isSelected =
                  answers[qIdx] === optIdx

                const isCorrect =
                  submitted &&
                  optIdx === q.correctIndex

                const isWrongSelected =
                  submitted &&
                  isSelected &&
                  optIdx !== q.correctIndex

                return (
                  <button
                    key={optIdx}
                    disabled={submitted}
                    onClick={() =>
                      setAnswers((a) =>
                        a.map((v, i) =>
                          i === qIdx
                            ? optIdx
                            : v
                        )
                      )
                    }
                    className={clsx(
                      'text-left px-3.5 py-2.5 rounded-xl border text-sm transition-colors',
                      isCorrect &&
                        'border-success bg-success/10 text-success',
                      isWrongSelected &&
                        'border-danger bg-danger/10 text-danger',
                      !submitted &&
                        isSelected &&
                        'border-signal-600 bg-signal-50 dark:bg-signal-900/30',
                      !submitted &&
                        !isSelected &&
                        'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)]'
                    )}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      {!submitted ? (
        <Button
          className="w-full mt-6"
          disabled={!allAnswered}
          onClick={submit}
        >
          Submit quiz
        </Button>
      ) : (
        <Button
          variant="secondary"
          className="w-full mt-6"
          onClick={onExit}
        >
          Back to quizzes
        </Button>
      )}
    </div>
  )
}
