import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { createNotificationOnce } from '../lib/notifications.js'

// Notifies once (ever, per item — see createNotificationOnce) when a real
// task or exam's due date falls within the next 24 hours. Completed tasks
// and items with no due date are skipped, so nothing fires for data that
// doesn't exist or is already done.
const WINDOW_MS = 24 * 60 * 60 * 1000

export function useDueSoonNotifications(tasks, exams) {
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) return
    const now = Date.now()

    tasks.forEach((t) => {
      if (t.done || !t.dueDate) return
      const due = new Date(t.dueDate).getTime()
      if (Number.isNaN(due)) return
      const diff = due - now
      if (diff > 0 && diff <= WINDOW_MS) {
        createNotificationOnce(currentUser.uid, `task-due-${t.id}`, {
          type: 'task-due',
          title: 'Task Due Soon',
          body: `"${t.title}" is due soon.`,
          link: '/tasks'
        })
      }
    })

    exams.forEach((x) => {
      if (!x.date) return
      const due = new Date(`${x.date}T23:59:59`).getTime()
      if (Number.isNaN(due)) return
      const diff = due - now
      if (diff > 0 && diff <= WINDOW_MS) {
        createNotificationOnce(currentUser.uid, `exam-due-${x.id}`, {
          type: 'exam-due',
          title: 'Upcoming Test',
          body: `"${x.title}" is coming up soon.`,
          link: '/exams'
        })
      }
    })
  }, [tasks, exams, currentUser])
}
