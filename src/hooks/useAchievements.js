import { useEffect, useState, useMemo, useRef } from 'react'
import { collection, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useGamification } from './useGamification.js'
import { ACHIEVEMENT_DEFS } from '../data/achievementDefs.js'
import { createNotificationOnce } from '../lib/notifications.js'

// Persisted unlocks live at users/{uid}/achievementUnlocks/{achievementId} —
// the achievement's own id is the document id, so "has this been unlocked
// before" is a single getDoc away, and writing it twice is a no-op check
// away from ever happening.
export function useAchievements() {
  const { currentUser } = useAuth()
  const { data, levelInfo, loading: gamLoading } = useGamification()
  const [unlocks, setUnlocks] = useState({})
  const [loading, setLoading] = useState(true)
  const processedRef = useRef(new Set())

  useEffect(() => {
    if (!currentUser) {
      setUnlocks({})
      setLoading(false)
      return
    }
    const colRef = collection(db, 'users', currentUser.uid, 'achievementUnlocks')
    const unsubscribe = onSnapshot(
      colRef,
      (snap) => {
        const map = {}
        snap.docs.forEach((d) => {
          map[d.id] = d.data()
        })
        setUnlocks(map)
        setLoading(false)
      },
      (err) => {
        console.error('useAchievements failed:', err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [currentUser])

  // Derived stats layered on top of the raw gamification counters — these
  // are the "combo" metrics a few achievements need (multi-feature usage,
  // best single-day task count, etc.) computed client-side rather than
  // stored as their own counters.
  const statValues = useMemo(() => {
    if (!data) return {}
    const featuresUsedAll =
      data.tasksAdded >= 1 && data.notesCreated >= 1 && data.examsAdded >= 1 && data.quizzesCreated >= 1 && data.focusSessions >= 1
        ? 1
        : 0
    const sameDayTasksMax = data.taskCompletionsByDay
      ? Math.max(0, ...Object.values(data.taskCompletionsByDay))
      : 0
    const unstoppable = data.streakDays >= 50 && data.tasksCompleted >= 100 ? 1 : 0
    // Approximation: exact "task completed on each of the last 7 days" isn't
    // tracked at that granularity, so this uses streak length as the proxy.
    const perfectWeek = data.streakDays >= 7 ? 1 : 0

    return {
      ...data,
      level: levelInfo.level,
      totalXp: levelInfo.totalXp,
      achievementsUnlocked: Object.keys(unlocks).length,
      featuresUsedAll,
      sameDayTasksMax,
      unstoppable,
      perfectWeek
    }
  }, [data, levelInfo, unlocks])

  const achievements = useMemo(() => {
    return ACHIEVEMENT_DEFS.map((def) => {
      const value = statValues[def.metric] || 0
      const eligible = value >= def.threshold
      const persisted = unlocks[def.id]
      return {
        ...def,
        unlocked: !!persisted,
        eligible,
        unlockedAt: persisted?.unlockedAt || null,
        progress: Math.min(100, Math.round((value / def.threshold) * 100)),
        value
      }
    })
  }, [statValues, unlocks])

  // Persist any newly-eligible-but-not-yet-unlocked achievements exactly
  // once: getDoc guards against duplicate writes even if this effect runs
  // more than once (StrictMode double-invoke, re-renders, etc.), and
  // processedRef additionally stops this session from re-attempting a
  // write it already made this render cycle.
  useEffect(() => {
    if (!currentUser || gamLoading || loading) return
    achievements.forEach(async (ach) => {
      if (!ach.eligible || ach.unlocked) return
      if (processedRef.current.has(ach.id)) return
      processedRef.current.add(ach.id)

      const ref = doc(db, 'users', currentUser.uid, 'achievementUnlocks', ach.id)
      const existing = await getDoc(ref)
      if (existing.exists()) return

      await setDoc(ref, { unlockedAt: serverTimestamp(), title: ach.title })
      await createNotificationOnce(currentUser.uid, `achievement-${ach.id}`, {
        type: 'achievement',
        title: 'Achievement Unlocked',
        body: `You unlocked "${ach.title}"!`,
        link: '/achievements'
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements, currentUser, gamLoading, loading])

  return { achievements, loading: loading || gamLoading }
}
