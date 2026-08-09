// Central rulebook for XP, levels, and streaks. Change numbers here only —
// nothing else in the app hardcodes an XP value or level formula.

export const XP_RULES = {
  taskCompleted: 15,
  noteCreated: 10,
  examAdded: 5,
  quizTaken: 20,
  quizPerfectBonus: 30,
  focusSessionCompleted: 25
}

// Level N requires N*100 + (N-1)*50 cumulative XP — a gentle, ever-increasing
// ramp (Level 1->2 needs 100 XP, 2->3 needs 250 more, 3->4 needs 400 more...).
export function levelFromXp(totalXp) {
  let level = 1
  let xpConsumed = 0
  // Safety cap so a corrupted/huge XP value can't loop forever.
  while (level < 999) {
    const xpForThisLevel = level * 100 + (level - 1) * 50
    if (totalXp < xpConsumed + xpForThisLevel) {
      return { level, currentLevelXp: totalXp - xpConsumed, xpForThisLevel, totalXp }
    }
    xpConsumed += xpForThisLevel
    level += 1
  }
  return { level, currentLevelXp: 0, xpForThisLevel: 100, totalXp }
}

function toDateOnly(dateStr) {
  return new Date(`${dateStr}T00:00:00`)
}

export function isConsecutiveDay(lastDateStr, todayStr) {
  if (!lastDateStr) return false
  const diffDays = Math.round((toDateOnly(todayStr) - toDateOnly(lastDateStr)) / 86400000)
  return diffDays === 1
}

export function isSameDay(dateStr, todayStr) {
  return dateStr === todayStr
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
