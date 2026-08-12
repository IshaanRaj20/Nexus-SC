import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'

// Creates a notification exactly once per dedupeId. The dedupeId IS the
// Firestore document ID for users/{uid}/notifications/{dedupeId} — so a
// getDoc-before-setDoc check guarantees the same real-world event (an
// achievement unlocking, a specific streak milestone, a specific task's
// due-soon reminder) can never produce two notification documents, no
// matter how many times the triggering code runs (page reloads, re-renders,
// re-navigating, etc.).
//
// Callers choose the dedupeId to match the granularity they want:
//   - `achievement-${achId}`      → once ever, per achievement
//   - `streak-milestone-${n}`     → once ever, per specific milestone value
//   - `streak-loss-${dateStr}`    → once per calendar day a loss occurs
//   - `task-due-${taskId}`        → once ever, per task
//   - `exam-due-${examId}`        → once ever, per exam
export async function createNotificationOnce(uid, dedupeId, { type, title, body, link }) {
  const ref = doc(db, 'users', uid, 'notifications', dedupeId)
  const existing = await getDoc(ref)
  if (existing.exists()) return false
  await setDoc(ref, {
    type,
    title,
    body,
    link: link || null,
    read: false,
    dismissed: false,
    createdAt: serverTimestamp()
  })
  return true
}
