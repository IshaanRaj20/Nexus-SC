import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  BookOpen,
  ListChecks,
  Lightbulb,
  Bold,
  Italic,
  Paperclip,
  X,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from 'lucide-react'
import clsx from 'clsx'
import Card from '../components/ui/Card.jsx'
import { aiConversation } from '../data/mockData.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getInitials, getAvatarColor } from '../lib/userDisplay.js'
import { chatWithGemini } from '../lib/gemini.js'

const suggestions = [
  {
    icon: BookOpen,
    text: 'Summarize my Cell Biology notes',
  },
  {
    icon: ListChecks,
    text: 'Plan my study schedule for this week',
  },
  {
    icon: Lightbulb,
    text: 'Quiz me on Linear Algebra',
  },
]

/* =========================================================
   HTML → MARKDOWN
   ========================================================= */

function htmlToMarkdown(html) {
  if (!html) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const convertNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const tag = node.tagName.toLowerCase()

    const children = Array.from(node.childNodes)
      .map(convertNode)
      .join('')

    switch (tag) {
      case 'strong':
      case 'b':
        return `**${children}**`

      case 'em':
      case 'i':
        return `*${children}*`

      case 'h1':
        return `# ${children.trim()}\n\n`

      case 'h2':
        return `## ${children.trim()}\n\n`

      case 'h3':
        return `### ${children.trim()}\n\n`

      case 'h4':
        return `#### ${children.trim()}\n\n`

      case 'p':
        return `${children.trim()}\n\n`

      case 'div':
        return `${children}\n`

      case 'br':
        return '\n'

      case 'li':
        return children

      case 'ul':
        return (
          Array.from(node.children)
            .map((li) => `- ${convertNode(li).trim()}`)
            .join('\n') + '\n\n'
        )

      case 'ol':
        return (
          Array.from(node.children)
            .map(
              (li, index) =>
                `${index + 1}. ${convertNode(li).trim()}`
            )
            .join('\n') + '\n\n'
        )

      case 'blockquote':
        return (
          children
            .split('\n')
            .filter(Boolean)
            .map((line) => `> ${line}`)
            .join('\n') + '\n\n'
        )

      default:
        return children
    }
  }

  return convertNode(doc.body)
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/* =========================================================
   INLINE MARKDOWN → HTML
   ========================================================= */

function renderInlineMarkdown(text) {
  let html = escapeHtml(text)

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-black/10 text-[0.9em]">$1</code>'
  )

  // Bold
  html = html.replace(
    /\*\*(.+?)\*\*/gs,
    '<strong>$1</strong>'
  )

  // Italic
  html = html.replace(
    /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
    '<em>$1</em>'
  )

  return html
}

/* =========================================================
   MARKDOWN → SAFE HTML

   Supports:

   # Heading 1
   ## Heading 2
   ### Heading 3

   **bold**
   *italic*

   - bullets
   * bullets

   1. numbered
   2. numbered
   ========================================================= */

function markdownToHtml(text) {
  if (!text) return ''

  const lines = String(text).replace(/\r\n/g, '\n').split('\n')

  let html = ''
  let paragraph = []
  let listType = null

  const closeList = () => {
    if (!listType) return

    html += listType === 'ul' ? '</ul>' : '</ol>'
    listType = null
  }

  const flushParagraph = () => {
    if (!paragraph.length) return

    const content = paragraph.join('\n').trim()

    if (content) {
      html += `
        <p class="mb-3 last:mb-0">
          ${renderInlineMarkdown(
            content
          ).replace(/\n/g, '<br />')}
        </p>
      `
    }

    paragraph = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    /* Empty line */
    if (!line) {
      flushParagraph()
      continue
    }

    /* H1 */
    const h1 = line.match(/^#\s+(.+)$/)

    if (h1) {
      flushParagraph()
      closeList()

      html += `
        <h1 class="text-2xl font-bold mt-4 mb-2 first:mt-0">
          ${renderInlineMarkdown(h1[1])}
        </h1>
      `

      continue
    }

    /* H2 */
    const h2 = line.match(/^##\s+(.+)$/)

    if (h2) {
      flushParagraph()
      closeList()

      html += `
        <h2 class="text-xl font-bold mt-4 mb-2 first:mt-0">
          ${renderInlineMarkdown(h2[1])}
        </h2>
      `

      continue
    }

    /* H3 */
    const h3 = line.match(/^###\s+(.+)$/)

    if (h3) {
      flushParagraph()
      closeList()

      html += `
        <h3 class="text-lg font-bold mt-3 mb-1.5 first:mt-0">
          ${renderInlineMarkdown(h3[1])}
        </h3>
      `

      continue
    }

    /* H4+ */
    const h4 = line.match(/^####\s+(.+)$/)

    if (h4) {
      flushParagraph()
      closeList()

      html += `
        <h4 class="font-bold mt-3 mb-1 first:mt-0">
          ${renderInlineMarkdown(h4[1])}
        </h4>
      `

      continue
    }

    /* Bullet */
    const bullet = line.match(/^[-*+]\s+(.+)$/)

    if (bullet) {
      flushParagraph()

      if (listType !== 'ul') {
        closeList()
        html += `
          <ul class="list-disc pl-6 mb-3 space-y-1">
        `
        listType = 'ul'
      }

      html += `
        <li>
          ${renderInlineMarkdown(bullet[1])}
        </li>
      `

      continue
    }

    /* Numbered list */
    const numbered = line.match(/^\d+[.)]\s+(.+)$/)

    if (numbered) {
      flushParagraph()

      if (listType !== 'ol') {
        closeList()
        html += `
          <ol class="list-decimal pl-6 mb-3 space-y-1">
        `
        listType = 'ol'
      }

      html += `
        <li>
          ${renderInlineMarkdown(numbered[1])}
        </li>
      `

      continue
    }

    /* Blockquote */
    const quote = line.match(/^>\s*(.*)$/)

    if (quote) {
      flushParagraph()
      closeList()

      html += `
        <blockquote class="border-l-4 border-signal-600/40 pl-4 my-3 opacity-90">
          ${renderInlineMarkdown(quote[1])}
        </blockquote>
      `

      continue
    }

    /* Normal paragraph line */
    closeList()
    paragraph.push(line)
  }

  flushParagraph()
  closeList()

  return html
}

/* =========================================================
   SANITIZE PASTED HTML

   Only allow formatting elements we actually support.
   ========================================================= */

function sanitizePastedHtml(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const allowed = new Set([
    'B',
    'STRONG',
    'I',
    'EM',
    'H1',
    'H2',
    'H3',
    'H4',
    'P',
    'BR',
    'DIV',
    'UL',
    'OL',
    'LI',
    'BLOCKQUOTE',
  ])

  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowed.has(child.tagName)) {
          const fragment = document.createDocumentFragment()

          while (child.firstChild) {
            fragment.appendChild(child.firstChild)
          }

          child.replaceWith(fragment)

          walk(node)
          return
        }

        // Remove inline styles, classes, IDs, etc.
        while (child.attributes.length > 0) {
          child.removeAttribute(child.attributes[0].name)
        }

        walk(child)
      }
    })
  }

  walk(doc.body)

  return doc.body.innerHTML
}

/* =========================================================
   RICH TEXT EDITOR
   ========================================================= */

function RichTextEditor({
  value,
  onChange,
  onSend,
  editorRef,
}) {
  const lastValueRef = useRef('')

  /* Keep React state and editor synchronized */
  useEffect(() => {
    if (!editorRef.current) return

    if (
      value === '' &&
      lastValueRef.current !== ''
    ) {
      editorRef.current.innerHTML = ''
    }

    lastValueRef.current = value
  }, [value, editorRef])

  /* =======================================================
     Formatting
     ======================================================= */

  const format = (command, valueArg = null) => {
    if (!editorRef.current) return

    editorRef.current.focus()

    document.execCommand(
      command,
      false,
      valueArg
    )

    const html =
      editorRef.current.innerHTML || ''

    lastValueRef.current = html
    onChange(html)
  }

  /* =======================================================
     Paste

     Preserves supported rich formatting.
     ======================================================= */

  const handlePaste = (e) => {
    e.preventDefault()

    const html =
      e.clipboardData.getData('text/html')

    const text =
      e.clipboardData.getData('text/plain')

    if (html) {
      const safeHtml =
        sanitizePastedHtml(html)

      document.execCommand(
        'insertHTML',
        false,
        safeHtml
      )
    } else {
      document.execCommand(
        'insertText',
        false,
        text
      )
    }

    const newHtml =
      editorRef.current?.innerHTML || ''

    lastValueRef.current = newHtml
    onChange(newHtml)
  }

  /* =======================================================
     Keyboard shortcuts
     ======================================================= */

  const handleKeyDown = (e) => {
    /* Ctrl/Cmd + B */
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === 'b'
    ) {
      e.preventDefault()
      format('bold')
      return
    }

    /* Ctrl/Cmd + I */
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === 'i'
    ) {
      e.preventDefault()
      format('italic')
      return
    }

    /* Ctrl/Cmd + Shift + 7 */
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      e.key === '7'
    ) {
      e.preventDefault()
      format('insertOrderedList')
      return
    }

    /* Ctrl/Cmd + Shift + 8 */
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      e.key === '8'
    ) {
      e.preventDefault()
      format('insertUnorderedList')
      return
    }

    /*
      Enter sends.

      Shift + Enter creates a normal new line.
    */
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault()
      onSend()
    }
  }

  const handleInput = () => {
    const html =
      editorRef.current?.innerHTML || ''

    lastValueRef.current = html
    onChange(html)
  }

  return (
    <div className="flex-1 min-w-0">
      {/* =================================================
          FORMATTING TOOLBAR
      ================================================= */}

      <div
        className="
          flex
          items-center
          gap-1
          px-2
          py-1.5
          bg-[var(--bg-surface-2)]
          border
          border-b-0
          border-[var(--border-subtle)]
          rounded-t-xl
          overflow-x-auto
          no-scrollbar
        "
      >
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() => format('bold')}
          aria-label="Bold"
          title="Bold (Ctrl+B)"
          className="
            w-8
            h-8
            shrink-0
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-[var(--bg-surface-1)]
            transition-colors
          "
        >
          <Bold size={16} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() => format('italic')}
          aria-label="Italic"
          title="Italic (Ctrl+I)"
          className="
            w-8
            h-8
            shrink-0
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-[var(--bg-surface-1)]
            transition-colors
          "
        >
          <Italic size={16} />
        </button>

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

        {/* H1 */}
        <button
          type="button"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            format('formatBlock', 'H1')
          }
          aria-label="Heading 1"
          title="Heading 1"
          className="
            w-8
            h-8
            shrink-0
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-[var(--bg-surface-1)]
            transition-colors
          "
        >
          <Heading1 size={17} />
        </button>

        {/* H2 */}
        <button
          type="button"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            format('formatBlock', 'H2')
          }
          aria-label="Heading 2"
          title="Heading 2"
          className="
            w-8
            h-8
            shrink-0
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-[var(--bg-surface-1)]
            transition-colors
          "
        >
          <Heading2 size={17} />
        </button>

        {/* H3 */}
        <button
          type="button"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            format('formatBlock', 'H3')
          }
          aria-label="Heading 3"
          title="Heading 3"
          className="
            w-8
            h-8
            shrink-0
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-[var(--bg-surface-1)]
            transition-colors
          "
        >
          <Heading3 size={17} />
        </button>

        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

        {/* Bullet list */}
        <button
          type="button"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            format('insertUnorderedList')
          }
          aria-label="Bullet list"
          title="Bullet list (Ctrl+Shift+8)"
          className="
            w-8
            h-8
            shrink-0
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-[var(--bg-surface-1)]
            transition-colors
          "
        >
          <List size={17} />
        </button>

        {/* Numbered list */}
        <button
          type="button"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            format('insertOrderedList')
          }
          aria-label="Numbered list"
          title="Numbered list (Ctrl+Shift+7)"
          className="
            w-8
            h-8
            shrink-0
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-[var(--bg-surface-1)]
            transition-colors
          "
        >
          <ListOrdered size={17} />
        </button>
      </div>

      {/* =================================================
          EDITOR
      ================================================= */}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder="Ask your AI study assistant…"
        className="
          min-h-[72px]
          max-h-56
          overflow-y-auto
          bg-[var(--bg-surface-2)]
          border
          border-[var(--border-subtle)]
          rounded-b-xl
          px-4
          py-3.5
          text-sm
          outline-none
          focus:ring-2
          focus:ring-signal-600/30
          leading-relaxed
          break-words

          [&_h1]:text-2xl
          [&_h1]:font-bold
          [&_h1]:my-2

          [&_h2]:text-xl
          [&_h2]:font-bold
          [&_h2]:my-2

          [&_h3]:text-lg
          [&_h3]:font-bold
          [&_h3]:my-1.5

          [&_ul]:list-disc
          [&_ul]:pl-6

          [&_ol]:list-decimal
          [&_ol]:pl-6

          [&_li]:my-0.5

          [&_strong]:font-bold
          [&_em]:italic

          empty:before:content-[attr(data-placeholder)]
          empty:before:text-[var(--text-secondary)]
          empty:before:pointer-events-none
        "
      />
    </div>
  )
}

/* =========================================================
   MAIN AI ASSISTANT
   ========================================================= */

export default function AIAssistant() {
  const { currentUser, userProfile } = useAuth()

  const name =
    userProfile?.name ||
    currentUser?.displayName ||
    currentUser?.email ||
    'You'

  const [messages, setMessages] =
    useState(aiConversation)

  const [input, setInput] = useState('')

  const [typing, setTyping] =
    useState(false)

  const [attachments, setAttachments] =
    useState([])

  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const editorRef = useRef(null)

  /* =======================================================
     Scroll to newest message
     ======================================================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, typing])

  /* =======================================================
     Cleanup attachment previews when component unmounts
     ======================================================= */

  useEffect(() => {
    return () => {
      attachments.forEach(
        (attachment) => {
          if (attachment.preview) {
            URL.revokeObjectURL(
              attachment.preview
            )
          }
        }
      )
    }
  }, [attachments])

  /* =======================================================
     File selection
     ======================================================= */

  const handleFiles = (files) => {
    if (!files?.length) return

    const selectedFiles =
      Array.from(files)

    const newAttachments =
      selectedFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,

        file,

        preview:
          file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : null,
      }))

    setAttachments((prev) => [
      ...prev,
      ...newAttachments,
    ])
  }

  /* =======================================================
     Remove attachment
     ======================================================= */

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const attachment =
        prev.find(
          (item) => item.id === id
        )

      if (attachment?.preview) {
        URL.revokeObjectURL(
          attachment.preview
        )
      }

      return prev.filter(
        (item) => item.id !== id
      )
    })
  }

  /* =======================================================
     Send
     ======================================================= */

  const send = async (text) => {
    const rawContent =
      text ?? input

    const markdownContent =
      htmlToMarkdown(rawContent)

    if (
      !markdownContent.trim() &&
      attachments.length === 0
    ) {
      return
    }

    const history = messages

    const sentAttachments =
      [...attachments]

    /* Add user message immediately */
    setMessages((prev) => [
      ...prev,
      {
        id: `u${Date.now()}`,
        role: 'user',
        text: markdownContent,
        attachments:
          sentAttachments,
      },
    ])

    /* Clear editor */
    setInput('')

    if (editorRef.current) {
      editorRef.current.innerHTML = ''
    }

    /*
      Important:
      Don't revoke previews here because
      the message still displays them.
    */
    setAttachments([])

    setTyping(true)

    try {
      const reply =
        await chatWithGemini(
          history,
          markdownContent,
          sentAttachments
        )

      setMessages((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          role: 'assistant',
          text: reply,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          role: 'assistant',
          text: `Sorry, something went wrong: ${err.message}`,
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  const sendSuggestion = (text) => {
    send(text)
  }

  return (
    <Card className="h-[calc(100vh-120px)] min-h-[600px] flex flex-col">
      {/* =================================================
          MESSAGE AREA
      ================================================= */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-4
          sm:px-6
          lg:px-8
          py-6
          sm:py-8
          flex
          flex-col
          gap-5
        "
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            userName={name}
            userPhoto={
              currentUser?.photoURL
            }
            userId={currentUser?.uid}
          />
        ))}

        {/* AI typing indicator */}
        {typing && (
          <div className="flex items-center gap-2 self-start">
            <div
              className="
                w-8
                h-8
                rounded-full
                bg-signal-600
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Sparkles
                size={15}
                className="text-white"
              />
            </div>

            <div
              className="
                bg-[var(--bg-surface-2)]
                rounded-2xl
                rounded-bl-sm
                px-5
                py-4
                flex
                gap-1
              "
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-[var(--text-secondary)]
                    animate-pop
                  "
                  style={{
                    animationDelay: `${i * 150}ms`,
                    animationIterationCount:
                      'infinite',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* =================================================
          SUGGESTIONS
      ================================================= */}

      {messages.length <= 3 && (
        <div
          className="
            px-4
            sm:px-6
            pb-3
            flex
            gap-2
            overflow-x-auto
            no-scrollbar
          "
        >
          {suggestions.map((suggestion) => {
            const Icon =
              suggestion.icon

            return (
              <button
                key={suggestion.text}
                type="button"
                onClick={() =>
                  sendSuggestion(
                    suggestion.text
                  )
                }
                className="
                  shrink-0
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  px-3
                  py-2
                  rounded-xl
                  border
                  border-[var(--border-subtle)]
                  hover:bg-[var(--bg-surface-2)]
                  transition-colors
                  whitespace-nowrap
                "
              >
                <Icon
                  size={14}
                  className="text-signal-600"
                />

                {suggestion.text}
              </button>
            )
          })}
        </div>
      )}

      {/* =================================================
          COMPOSER
      ================================================= */}

      <div
        className="
          relative
          border-t
          border-[var(--border-subtle)]
          p-4
          sm:p-5
          lg:p-6
        "
      >
        {/* Attachment previews */}

        {attachments.length > 0 && (
          <div className="mb-4">
            <div
              className="
                flex
                gap-3
                overflow-x-auto
                no-scrollbar
              "
            >
              {attachments.map(
                (attachment) => {
                  const file =
                    attachment.file

                  const isImage =
                    file.type.startsWith(
                      'image/'
                    )

                  return (
                    <div
                      key={attachment.id}
                      className="
                        relative
                        shrink-0
                        w-56
                        min-h-20
                        rounded-xl
                        overflow-hidden
                        border
                        border-[var(--border-subtle)]
                        bg-[var(--bg-surface-2)]
                      "
                    >
                      {isImage &&
                      attachment.preview ? (
                        <>
                          <img
                            src={
                              attachment.preview
                            }
                            alt={file.name}
                            className="
                              w-full
                              h-auto
                              max-h-40
                              object-contain
                            "
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeAttachment(
                                attachment.id
                              )
                            }
                            className="
                              absolute
                              top-2
                              right-2
                              w-7
                              h-7
                              rounded-full
                              bg-black/70
                              text-white
                              flex
                              items-center
                              justify-center
                              hover:bg-black/90
                            "
                            aria-label={`Remove ${file.name}`}
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div
                          className="
                            min-h-20
                            flex
                            items-center
                            gap-3
                            p-3
                            pr-10
                          "
                        >
                          <div
                            className="
                              w-10
                              h-10
                              rounded-lg
                              bg-signal-600/10
                              flex
                              items-center
                              justify-center
                              shrink-0
                            "
                          >
                            <FileText
                              size={22}
                              className="text-signal-600"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {file.name}
                            </div>

                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                              {(
                                file.size /
                                1024 /
                                1024
                              ).toFixed(2)}{' '}
                              MB
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeAttachment(
                                attachment.id
                              )
                            }
                            className="
                              absolute
                              top-2
                              right-2
                              w-7
                              h-7
                              rounded-full
                              hover:bg-black/10
                              flex
                              items-center
                              justify-center
                            "
                            aria-label={`Remove ${file.name}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                }
              )}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Hidden file picker */}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="
              image/png,
              image/jpeg,
              image/webp,
              image/gif,
              application/pdf,
              text/plain,
              text/csv,
              application/json,
              text/html,
              text/css,
              application/javascript
            "
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />

          {/* Attach */}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            aria-label="Attach files"
            title="Attach files"
            className="
              shrink-0
              w-11
              h-11
              rounded-xl
              flex
              items-center
              justify-center
              hover:bg-[var(--bg-surface-2)]
              transition-colors
            "
          >
            <Paperclip size={18} />
          </button>

          {/* Rich editor */}

          <RichTextEditor
            value={input}
            onChange={setInput}
            onSend={() => send(input)}
            editorRef={editorRef}
          />

          {/* Send */}

          <button
            type="button"
            onClick={() => send(input)}
            aria-label="Send message"
            className="
              shrink-0
              w-11
              h-11
              rounded-xl
              bg-signal-600
              hover:bg-signal-700
              text-white
              flex
              items-center
              justify-center
              transition-colors
              active:scale-95
            "
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </Card>
  )
}

/* =========================================================
   MESSAGE BUBBLE
   ========================================================= */

function MessageBubble({
  message,
  userName,
  userPhoto,
  userId,
}) {
  const isUser =
    message.role === 'user'

  const initials =
    getInitials(userName)

  const avatarColor =
    getAvatarColor(
      userId || userName
    )

  return (
    <div
      className={clsx(
        'flex items-end gap-2 animate-slide-up',
        isUser &&
          'flex-row-reverse'
      )}
    >
      {/* Avatar */}

      {isUser && userPhoto ? (
        <img
          src={userPhoto}
          alt={userName}
          className="
            w-8
            h-8
            rounded-full
            object-cover
            shrink-0
          "
        />
      ) : (
        <div
          className={clsx(
            `
              w-8
              h-8
              rounded-full
              flex
              items-center
              justify-center
              shrink-0
              text-white
              text-xs
              font-semibold
            `,
            !isUser &&
              'bg-signal-600'
          )}
          style={
            isUser
              ? {
                  backgroundColor:
                    avatarColor,
                }
              : undefined
          }
        >
          {isUser ? (
            initials
          ) : (
            <Sparkles size={15} />
          )}
        </div>
      )}

      {/* Message */}

      <div
        className={clsx(
          `
            max-w-[85%]
            sm:max-w-[75%]
            px-5
            py-3.5
            text-sm
            leading-relaxed
            rounded-2xl
            break-words
          `,
          isUser
            ? `
              bg-signal-600
              text-white
              rounded-br-sm
            `
            : `
              bg-[var(--bg-surface-2)]
              text-[var(--text-primary)]
              rounded-bl-sm
            `
        )}
      >
        {/* Attachments */}

        {message.attachments?.length >
          0 && (
          <div className="flex flex-col gap-3 mb-3">
            {message.attachments.map(
              (attachment) => {
                const file =
                  attachment.file

                const isImage =
                  file.type.startsWith(
                    'image/'
                  )

                if (
                  isImage &&
                  attachment.preview
                ) {
                  return (
                    <img
                      key={
                        attachment.id
                      }
                      src={
                        attachment.preview
                      }
                      alt={file.name}
                      className="
                        max-w-full
                        max-h-72
                        rounded-xl
                        object-contain
                      "
                    />
                  )
                }

                return (
                  <div
                    key={
                      attachment.id
                    }
                    className="
                      w-full
                      min-h-20
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      p-3
                      bg-black/10
                    "
                  >
                    <div
                      className="
                        w-10
                        h-10
                        rounded-lg
                        bg-signal-600/10
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <FileText
                        size={22}
                        className="text-signal-600"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {file.name}
                      </div>

                      <div className="text-xs opacity-70 mt-1">
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{' '}
                        MB
                      </div>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}

        {/* Formatted text */}

        {message.text && (
          <div
            className="
              break-words

              [&_strong]:font-bold
              [&_em]:italic

              [&_h1]:text-2xl
              [&_h1]:font-bold
              [&_h1]:mt-4
              [&_h1]:mb-2
              [&_h1:first-child]:mt-0

              [&_h2]:text-xl
              [&_h2]:font-bold
              [&_h2]:mt-4
              [&_h2]:mb-2
              [&_h2:first-child]:mt-0

              [&_h3]:text-lg
              [&_h3]:font-bold
              [&_h3]:mt-3
              [&_h3]:mb-1.5

              [&_ul]:list-disc
              [&_ul]:pl-6
              [&_ul]:mb-3

              [&_ol]:list-decimal
              [&_ol]:pl-6
              [&_ol]:mb-3

              [&_li]:my-0.5

              [&_blockquote]:border-l-4
              [&_blockquote]:border-signal-600/40
              [&_blockquote]:pl-4
            "
            dangerouslySetInnerHTML={{
              __html:
                markdownToHtml(
                  message.text
                ),
            }}
          />
        )}
      </div>
    </div>
  )
}