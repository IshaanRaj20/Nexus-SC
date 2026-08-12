import { useEffect, useState, useCallback } from 'react'
import { doc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { XP_RULES, levelFromXp, isConsecutiveDay, isSameDay, todayStr } from '../lib/gamificationRules.js'
import { createNotificationOnce } from '../lib/notifications.js'

const INITIAL_STATE = {
  totalXp: 0,
  streakDays: 0,
  lastActiveDate: null,
  daysActive: 0,
  streakComebacks: 0,
  tasksCompleted: 0,
  tasksAdded: 0,
  earlyTasks: 0,
  onTimeTasks: 0,
  taskCompletionsByDay: {},
  notesCreated: 0,
  examsAdded: 0,
  quizzesCreated: 0,
  quizzesTaken: 0,
  perfectQuizzes: 0,
  focusSessions: 0
}

const COUNTER_FIELD = {
  noteCreated: 'notesCreated',
  examAdded: 'examsAdded',
  quizTaken: 'quizzesTaken',
  focusSessionCompleted: 'focusSessions'
}

// Single source of truth for gamification, stored at
// users/{uid}/meta/gamification. One document (rather than a growing "XP
// events" log) keeps this cheap — one realtime listener, no aggregation
// queries — while still tracking everything achievements/notifications need.
export function useGamification() {
  const { currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setData(null)
      setLoading(false)
      return
    }
    const ref = doc(db, 'users', currentUser.uid, 'meta', 'gamification')
    const unsubscribe = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        await setDoc(ref, INITIAL_STATE)
        setData(INITIAL_STATE)
      } else {
        setData({ ...INITIAL_STATE, ...snap.data() })
      }
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  // Bumps the streak + daysActive at most once per calendar day. Also
  // generates (deduplicated) streak-milestone and streak-loss notifications
  // right at the point the transition is detected — this is the ONLY place
  // streakDays changes, so it's the only place these can fire, which is
  // what keeps them from duplicating on reloads/re-renders.
  const touchStreak = useCallback(async () => {
    if (!currentUser || !data) return
    const today = todayStr()
    if (isSameDay(data.lastActiveDate, today)) return

    const ref = doc(db, 'users', currentUser.uid, 'meta', 'gamification')
    const continuing = isConsecutiveDay(data.lastActiveDate, today)
    const previousStreak = data.streakDays || 0
    const newStreak = continuing ? previousStreak + 1 : 1

    const patch = {
      streakDays: newStreak,
      lastActiveDate: today,
      daysActive: increment(1)
    }

    // A real streak was broken (not just "this is day one ever") — notify,
    // once, for this specific day's loss.
    if (!continuing && previousStreak >= 2) {
      patch.streakComebacks = increment(1)
      await createNotificationOnce(currentUser.uid, `streak-loss-${today}`, {
        type: 'streak-loss',
        title: 'Streak Lost',
        body: 'Your streak ended. Start a new one today!',
        link: '/'
      })
    }

    await updateDoc(ref, patch)

    // Streak milestone: notify once, ever, per multiple-of-5 value, exactly
    // when the streak first crosses it.
    const newMilestone = Math.floor(newStreak / 5) * 5
    const previousMilestone = Math.floor(previousStreak / 5) * 5
    if (newMilestone >= 5 && newMilestone > previousMilestone) {
      await createNotificationOnce(currentUser.uid, `streak-milestone-${newMilestone}`, {
        type: 'streak-milestone',
        title: 'Streak Milestone',
        body: `You reached a ${newMilestone}-day streak!`,
        link: '/achievements'
      })
    }
  }, [currentUser, data])

  // Runs once per app load (per day) so streak/daysActive advance just by
  // using the app that day — not only when a specific XP-earning action
  // happens. Safe to call repeatedly: touchStreak no-ops after the first
  // successful run each day.
  useEffect(() => {
    if (!currentUser || loading) return
    touchStreak()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loading])

  // action: one of the XP_RULES keys (excluding taskCompleted, which has its
  // own completeTask() below because it needs due-date comparison).
  // extra.perfect adds the quiz bonus + counter.
  const awardXp = useCallback(
    async (action, extra = {}) => {
      if (!currentUser) return
      await touchStreak()
      const ref = doc(db, 'users', currentUser.uid, 'meta', 'gamification')
      const baseXp = XP_RULES[action] || 0
      const bonusXp = extra.perfect ? XP_RULES.quizPerfectBonus : 0

      const patch = { totalXp: increment(baseXp + bonusXp) }
      const counterField = COUNTER_FIELD[action]
      if (counterField) patch[counterField] = increment(1)
      if (extra.perfect) patch.perfectQuizzes = increment(1)

      await updateDoc(ref, patch)
    },
    [currentUser, touchStreak]
  )

  // Dedicated path for task completion: awards XP, bumps the same-day
  // completion map (for the "N tasks in one day" achievements), and checks
  // the task's own due date for the early/on-time achievements.
  const completeTask = useCallback(
    async (dueDateStr) => {
      if (!currentUser) return
      await touchStreak()
      const ref = doc(db, 'users', currentUser.uid, 'meta', 'gamification')
      const today = todayStr()

      const patch = {
        totalXp: increment(XP_RULES.taskCompleted),
        tasksCompleted: increment(1),
        [`taskCompletionsByDay.${today}`]: increment(1)
      }

      if (dueDateStr) {
        const due = new Date(dueDateStr)
        const now = new Date()
        if (!Number.isNaN(due.getTime())) {
          if (now <= due) patch.onTimeTasks = increment(1)
          if (now < due) patch.earlyTasks = increment(1)
        }
      }

      await updateDoc(ref, patch)
    },
    [currentUser, touchStreak]
  )

  // Lightweight counters for "added" events that don't earn XP on their own
  // (creating a task/quiz — XP for those comes from completing/taking them).
  const recordAdd = useCallback(
    async (kind) => {
      if (!currentUser) return
      const ref = doc(db, 'users', currentUser.uid, 'meta', 'gamification')
      const field = kind === 'taskAdded' ? 'tasksAdded' : 'quizzesCreated'
      await updateDoc(ref, { [field]: increment(1) })
    },
    [currentUser]
  )

  const levelInfo = levelFromXp(data?.totalXp || 0)

  return { data: data || INITIAL_STATE, loading, awardXp, completeTask, recordAdd, levelInfo }
}
