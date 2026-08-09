import { useRef, useEffect, useCallback } from 'react'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'
import clsx from 'clsx'

const COMMANDS = [
  { cmd: 'bold', icon: Bold, label: 'Bold' },
  { cmd: 'italic', icon: Italic, label: 'Italic' },
  { cmd: 'underline', icon: Underline, label: 'Underline' },
  { cmd: 'insertUnorderedList', icon: List, label: 'Bullet list' },
  { cmd: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' }
]

// A small contentEditable-based rich text editor. Deliberately dependency-free
// (no Slate/TipTap) so it works without adding to the install list — good
// enough for note formatting (bold/italic/underline/lists) without the
// complexity of a full document-editing framework.
export default function RichTextEditor({ value, onChange, placeholder = 'Start typing…', className }) {
  const ref = useRef(null)
  const hasInitialized = useRef(false)

  // Only set innerHTML once (or when switching to a different note) —
  // syncing on every keystroke would fight the cursor position.
  useEffect(() => {
    if (ref.current && !hasInitialized.current) {
      ref.current.innerHTML = value || ''
      hasInitialized.current = true
    }
  }, [value])

  const exec = useCallback(
    (cmd) => {
      document.execCommand(cmd, false, null)
      ref.current?.focus()
      onChange(ref.current?.innerHTML || '')
    },
    [onChange]
  )

  const handleInput = () => onChange(ref.current?.innerHTML || '')

  return (
    <div className={clsx('border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)]', className)}>
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]">
        {COMMANDS.map(({ cmd, icon: Icon, label }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(cmd)}
            aria-label={label}
            title={label}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-secondary)]"
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className={clsx(
          'min-h-[160px] max-h-[420px] overflow-y-auto px-4 py-3 text-sm leading-relaxed outline-none',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-semibold [&_strong]:font-semibold',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--text-secondary)]'
        )}
      />
    </div>
  )
}
