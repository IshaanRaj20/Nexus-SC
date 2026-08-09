import { useEffect, useState, useCallback } from 'react'
import { doc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { XP_RULES, levelFromXp, isConsecutiveDay, isSameDay, todayStr } from '../lib/gamificationRules.js'

const INITIAL_STATE = {
  totalXp: 0,
  streakDays: 0,
  lastActiveDate: null,
  tasksCompleted: 0,
  notesCreated: 0,
  examsAdded: 0,
  quizzesTaken: 0,
  perfectQuizzes: 0,
  focusSessions: 0
}

const COUNTER_FIELD = {
  taskCompleted: 'tasksCompleted',
  noteCreated: 'notesCreated',
  examAdded: 'examsAdded',
  quizTaken: 'quizzesTaken',
  focusSessionCompleted: 'focusSessions'
}

// Single source of truth for gamification, stored at
// users/{uid}/meta/gamification. One document (rather than a growing "XP
// events" log) keeps this cheap — one realtime listener, no aggregation
// queries — while still tracking everything achievements need.
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

  // Bumps the streak at most once per calendar day: +1 if yesterday was the
  // last active day, reset to 1 if a day was missed (or this is day one).
  const touchStreak = useCallback(async () => {
    if (!currentUser || !data) return
    const today = todayStr()
    if (isSameDay(data.lastActiveDate, today)) return
    const ref = doc(db, 'users', currentUser.uid, 'meta', 'gamification')
    const continuing = isConsecutiveDay(data.lastActiveDate, today)
    await updateDoc(ref, {
      streakDays: continuing ? increment(1) : 1,
      lastActiveDate: today
    })
  }, [currentUser, data])

  // action: one of the XP_RULES keys. extra.perfect adds the quiz bonus + counter.
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

  const levelInfo = levelFromXp(data?.totalXp || 0)

  return { data: data || INITIAL_STATE, loading, awardXp, levelInfo }
}
