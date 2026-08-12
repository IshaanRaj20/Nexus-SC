import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, BookOpen, ListChecks, Lightbulb } from 'lucide-react'
import clsx from 'clsx'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { aiConversation } from '../data/mockData.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getInitials, getAvatarColor } from '../lib/userDisplay.js'

const suggestions = [
  { icon: BookOpen, text: 'Summarize my Cell Biology notes' },
  { icon: ListChecks, text: 'Plan my study schedule for this week' },
  { icon: Lightbulb, text: 'Quiz me on Linear Algebra' }
]

export default function AIAssistant() {
  const { currentUser, userProfile } = useAuth()
  const name = userProfile?.name || currentUser?.displayName || currentUser?.email || 'You'
  const [messages, setMessages] = useState(aiConversation)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = (text) => {
    const content = text ?? input
    if (!content.trim()) return
    setMessages((prev) => [...prev, { id: `u${Date.now()}`, role: 'user', text: content }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          role: 'assistant',
          text: "That's a great question — this is a Phase 1 mock response. Once the AI backend is connected, I'll generate a real, personalized answer here."
        }
      ])
    }, 1200)
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-6.5rem)]">
      <PageHeader title="AI Assistant" subtitle="Ask anything about your courses, tasks, or study plan." />

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col gap-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} userName={name} userPhoto={currentUser?.photoURL} userId={currentUser?.uid} />
          ))}
          {typing && (
            <div className="flex items-center gap-2 self-start">
              <div className="w-8 h-8 rounded-full bg-signal-600 flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-white" />
              </div>
              <div className="bg-[var(--bg-surface-2)] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-pop"
                    style={{ animationDelay: `${i * 150}ms`, animationIterationCount: 'infinite' }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 3 && (
          <div className="px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  className="shrink-0 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)] transition-colors whitespace-nowrap"
                >
                  <Icon size={14} className="text-signal-600" /> {s.text}
                </button>
              )
            })}
          </div>
        )}

        <div className="border-t border-[var(--border-subtle)] p-3 sm:p-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask your AI study assistant…"
            className="flex-1 bg-[var(--bg-surface-2)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-signal-600/30"
          />
          <button
            onClick={() => send()}
            aria-label="Send message"
            className="shrink-0 w-11 h-11 rounded-xl bg-signal-600 hover:bg-signal-700 text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </Card>
    </div>
  )
}

function MessageBubble({ message, userName, userPhoto, userId }) {
  const isUser = message.role === 'user'
  const initials = getInitials(userName)
  const avatarColor = getAvatarColor(userId || userName)
  return (
    <div className={clsx('flex items-end gap-2 animate-slide-up', isUser && 'flex-row-reverse')}>
      {isUser && userPhoto ? (
        <img src={userPhoto} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-semibold',
            !isUser && 'bg-signal-600'
          )}
          style={isUser ? { backgroundColor: avatarColor } : undefined}
        >
          {isUser ? initials : <Sparkles size={15} />}
        </div>
      )}
      <div
        className={clsx(
          'max-w-[80%] sm:max-w-[70%] px-4 py-2.5 text-sm leading-relaxed rounded-2xl',
          isUser
            ? 'bg-signal-600 text-white rounded-br-sm'
            : 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] rounded-bl-sm'
        )}
      >
        {message.text}
      </div>
    </div>
  )
}
