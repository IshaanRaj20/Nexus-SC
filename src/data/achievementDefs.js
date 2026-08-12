// Every achievement is defined by which counter it reads (from the
// gamification document — see useGamification.js) and the threshold that
// unlocks it. Nothing here is hand-toggled; unlock state is computed from
// real data in useAchievements.js, then persisted once via markUnlocked.
//
// metric values map to fields on the gamification doc:
//   tasksCompleted, tasksAdded, notesCreated, examsAdded, quizzesCreated,
//   quizzesTaken, perfectQuizzes, focusSessions, streakDays, level, totalXp,
//   earlyTasks, onTimeTasks, sameDayTasksMax, daysActive, achievementsUnlocked,
//   featuresUsedAll, perfectWeek, streakComebacks, unstoppable
//
// `secret: true` hides title/description until unlocked (shown as a mystery
// card instead) — but the requirement is still a normal, deterministic
// threshold check like every other achievement.

export const ACHIEVEMENT_DEFS = [
  // ============ STREAKS ============
  { id: 'streak-3', category: 'streaks', title: '3-Day Streak', description: 'Study 3 days in a row', icon: 'Flame', tier: 'bronze', metric: 'streakDays', threshold: 3 },
  { id: 'streak-5', category: 'streaks', title: '5-Day Streak', description: 'Study 5 days in a row', icon: 'Flame', tier: 'bronze', metric: 'streakDays', threshold: 5 },
  { id: 'streak-7', category: 'streaks', title: '7-Day Streak', description: 'Study 7 days in a row', icon: 'Flame', tier: 'silver', metric: 'streakDays', threshold: 7 },
  { id: 'streak-10', category: 'streaks', title: '10-Day Streak', description: 'Study 10 days in a row', icon: 'Flame', tier: 'silver', metric: 'streakDays', threshold: 10 },
  { id: 'streak-15', category: 'streaks', title: '15-Day Streak', description: 'Study 15 days in a row', icon: 'Flame', tier: 'silver', metric: 'streakDays', threshold: 15 },
  { id: 'streak-20', category: 'streaks', title: '20-Day Streak', description: 'Study 20 days in a row', icon: 'Flame', tier: 'gold', metric: 'streakDays', threshold: 20 },
  { id: 'streak-30', category: 'streaks', title: '30-Day Streak', description: 'Study 30 days in a row', icon: 'Flame', tier: 'gold', metric: 'streakDays', threshold: 30 },
  { id: 'streak-50', category: 'streaks', title: '50-Day Streak', description: 'Study 50 days in a row', icon: 'Flame', tier: 'gold', metric: 'streakDays', threshold: 50 },
  { id: 'streak-75', category: 'streaks', title: '75-Day Streak', description: 'Study 75 days in a row', icon: 'Flame', tier: 'gold', metric: 'streakDays', threshold: 75 },
  { id: 'streak-100', category: 'streaks', title: '100-Day Streak', description: 'Study 100 days in a row', icon: 'Flame', tier: 'gold', metric: 'streakDays', threshold: 100 },

  // ============ TASKS ============
  { id: 'task-1', category: 'tasks', title: 'First Steps', description: 'Complete your first task', icon: 'Footprints', tier: 'bronze', metric: 'tasksCompleted', threshold: 1 },
  { id: 'task-5', category: 'tasks', title: 'Warming Up', description: 'Complete 5 tasks', icon: 'CheckSquare', tier: 'bronze', metric: 'tasksCompleted', threshold: 5 },
  { id: 'task-10', category: 'tasks', title: 'Getting Things Done', description: 'Complete 10 tasks', icon: 'CheckCircle2', tier: 'bronze', metric: 'tasksCompleted', threshold: 10 },
  { id: 'task-25', category: 'tasks', title: 'Task Master', description: 'Complete 25 tasks', icon: 'ListChecks', tier: 'silver', metric: 'tasksCompleted', threshold: 25 },
  { id: 'task-50', category: 'tasks', title: 'Task Legend', description: 'Complete 50 tasks', icon: 'Award', tier: 'silver', metric: 'tasksCompleted', threshold: 50 },
  { id: 'task-100', category: 'tasks', title: 'Century Club', description: 'Complete 100 tasks', icon: 'Trophy', tier: 'gold', metric: 'tasksCompleted', threshold: 100 },
  { id: 'task-early-1', category: 'tasks', title: 'Ahead of Schedule', description: 'Complete a task before its due date', icon: 'FastForward', tier: 'bronze', metric: 'earlyTasks', threshold: 1 },
  { id: 'task-early-10', category: 'tasks', title: 'Always Early', description: 'Complete 10 tasks before their due date', icon: 'Rocket', tier: 'silver', metric: 'earlyTasks', threshold: 10 },
  { id: 'task-sameday-3', category: 'tasks', title: 'Triple Play', description: 'Complete 3 tasks in a single day', icon: 'Zap', tier: 'bronze', metric: 'sameDayTasksMax', threshold: 3 },
  { id: 'task-sameday-5', category: 'tasks', title: 'On a Roll', description: 'Complete 5 tasks in a single day', icon: 'Zap', tier: 'silver', metric: 'sameDayTasksMax', threshold: 5 },

  // ============ SCHOOLWORK (notes) ============
  { id: 'note-1', category: 'schoolwork', title: 'First Note', description: 'Create your first note', icon: 'FileText', tier: 'bronze', metric: 'notesCreated', threshold: 1 },
  { id: 'note-10', category: 'schoolwork', title: 'Note Taker', description: 'Create 10 notes', icon: 'NotebookPen', tier: 'bronze', metric: 'notesCreated', threshold: 10 },
  { id: 'note-25', category: 'schoolwork', title: 'Prolific Writer', description: 'Create 25 notes', icon: 'PenLine', tier: 'silver', metric: 'notesCreated', threshold: 25 },
  { id: 'note-50', category: 'schoolwork', title: 'Archivist', description: 'Create 50 notes', icon: 'BookOpen', tier: 'gold', metric: 'notesCreated', threshold: 50 },
  { id: 'note-75', category: 'schoolwork', title: 'Knowledge Base', description: 'Create 75 notes', icon: 'Library', tier: 'gold', metric: 'notesCreated', threshold: 75 },

  // ============ TESTS & QUIZZES ============
  { id: 'exam-1', category: 'tests', title: 'Planner', description: 'Add your first exam', icon: 'CalendarPlus', tier: 'bronze', metric: 'examsAdded', threshold: 1 },
  { id: 'exam-3', category: 'tests', title: 'Prepared', description: 'Add 3 exams', icon: 'ClipboardList', tier: 'bronze', metric: 'examsAdded', threshold: 3 },
  { id: 'exam-5', category: 'tests', title: 'Exam Ready', description: 'Add 5 exams', icon: 'GraduationCap', tier: 'silver', metric: 'examsAdded', threshold: 5 },
  { id: 'exam-10', category: 'tests', title: 'Semester Veteran', description: 'Add 10 exams', icon: 'School', tier: 'gold', metric: 'examsAdded', threshold: 10 },
  { id: 'quiz-1', category: 'tests', title: 'Quiz Taker', description: 'Take your first quiz', icon: 'Brain', tier: 'bronze', metric: 'quizzesTaken', threshold: 1 },
  { id: 'quiz-5', category: 'tests', title: 'Quiz Enthusiast', description: 'Take 5 quizzes', icon: 'BrainCog', tier: 'bronze', metric: 'quizzesTaken', threshold: 5 },
  { id: 'quiz-10', category: 'tests', title: 'Quiz Regular', description: 'Take 10 quizzes', icon: 'BrainCircuit', tier: 'silver', metric: 'quizzesTaken', threshold: 10 },
  { id: 'quiz-25', category: 'tests', title: 'Quiz Machine', description: 'Take 25 quizzes', icon: 'Cpu', tier: 'gold', metric: 'quizzesTaken', threshold: 25 },
  { id: 'quiz-perfect-1', category: 'tests', title: 'Quiz Champion', description: 'Score 100% on a quiz', icon: 'Trophy', tier: 'gold', metric: 'perfectQuizzes', threshold: 1 },
  { id: 'quiz-perfect-5', category: 'tests', title: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: 'Sparkles', tier: 'gold', metric: 'perfectQuizzes', threshold: 5 },
  { id: 'quiz-perfect-10', category: 'tests', title: 'Flawless', description: 'Score 100% on 10 quizzes', icon: 'Gem', tier: 'gold', metric: 'perfectQuizzes', threshold: 10 },

  // ============ PRODUCTIVITY (focus sessions) ============
  { id: 'focus-1', category: 'productivity', title: 'First Focus', description: 'Complete your first focus session', icon: 'Target', tier: 'bronze', metric: 'focusSessions', threshold: 1 },
  { id: 'focus-5', category: 'productivity', title: 'Getting Focused', description: 'Complete 5 focus sessions', icon: 'Crosshair', tier: 'bronze', metric: 'focusSessions', threshold: 5 },
  { id: 'focus-10', category: 'productivity', title: 'Focus Regular', description: 'Complete 10 focus sessions', icon: 'Timer', tier: 'silver', metric: 'focusSessions', threshold: 10 },
  { id: 'focus-25', category: 'productivity', title: 'Focus Master', description: 'Complete 25 focus sessions', icon: 'Hourglass', tier: 'gold', metric: 'focusSessions', threshold: 25 },
  { id: 'focus-50', category: 'productivity', title: 'Deep Work', description: 'Complete 50 focus sessions', icon: 'BrainCircuit', tier: 'gold', metric: 'focusSessions', threshold: 50 },
  { id: 'focus-100', category: 'productivity', title: 'Flow State', description: 'Complete 100 focus sessions', icon: 'Infinity', tier: 'gold', metric: 'focusSessions', threshold: 100 },

  // ============ ORGANIZATION ============
  { id: 'org-active-3', category: 'organization', title: 'Getting Organized', description: 'Be active in Nexus on 3 different days', icon: 'CalendarCheck', tier: 'bronze', metric: 'daysActive', threshold: 3 },
  { id: 'org-active-14', category: 'organization', title: 'Consistent Planner', description: 'Be active in Nexus on 14 different days', icon: 'CalendarClock', tier: 'silver', metric: 'daysActive', threshold: 14 },
  { id: 'org-active-30', category: 'organization', title: 'Nexus Regular', description: 'Be active in Nexus on 30 different days', icon: 'CalendarDays', tier: 'gold', metric: 'daysActive', threshold: 30 },
  { id: 'org-active-60', category: 'organization', title: 'Nexus Habit', description: 'Be active in Nexus on 60 different days', icon: 'CalendarRange', tier: 'gold', metric: 'daysActive', threshold: 60 },
  { id: 'org-ontime-5', category: 'organization', title: 'Punctual', description: 'Complete 5 tasks on or before their due date', icon: 'AlarmClock', tier: 'bronze', metric: 'onTimeTasks', threshold: 5 },
  { id: 'org-ontime-20', category: 'organization', title: 'Deadline Keeper', description: 'Complete 20 tasks on or before their due date', icon: 'AlarmCheck', tier: 'silver', metric: 'onTimeTasks', threshold: 20 },
  { id: 'org-ontime-50', category: 'organization', title: 'Never Late', description: 'Complete 50 tasks on or before their due date', icon: 'ShieldCheck', tier: 'gold', metric: 'onTimeTasks', threshold: 50 },

  // ============ MILESTONES ============
  { id: 'milestone-login', category: 'milestones', title: 'Welcome to Nexus', description: 'Sign in for the first time', icon: 'DoorOpen', tier: 'bronze', metric: 'daysActive', threshold: 1 },
  { id: 'milestone-task', category: 'milestones', title: 'First Task', description: 'Add your first task', icon: 'ListPlus', tier: 'bronze', metric: 'tasksAdded', threshold: 1 },
  { id: 'milestone-test', category: 'milestones', title: 'First Test Added', description: 'Add your first exam', icon: 'FilePlus', tier: 'bronze', metric: 'examsAdded', threshold: 1 },
  { id: 'milestone-quiz', category: 'milestones', title: 'First Quiz Added', description: 'Create your first quiz', icon: 'FilePlus2', tier: 'bronze', metric: 'quizzesCreated', threshold: 1 },
  { id: 'milestone-note', category: 'milestones', title: 'First Note', description: 'Create your first note', icon: 'StickyNote', tier: 'bronze', metric: 'notesCreated', threshold: 1 },
  { id: 'milestone-focus', category: 'milestones', title: 'First Focus Session', description: 'Complete your first focus session', icon: 'Play', tier: 'bronze', metric: 'focusSessions', threshold: 1 },
  { id: 'level-5', category: 'milestones', title: 'Rising Star', description: 'Reach Level 5', icon: 'Star', tier: 'silver', metric: 'level', threshold: 5 },
  { id: 'level-10', category: 'milestones', title: 'Nexus Veteran', description: 'Reach Level 10', icon: 'Crown', tier: 'gold', metric: 'level', threshold: 10 },
  { id: 'level-20', category: 'milestones', title: 'Nexus Legend', description: 'Reach Level 20', icon: 'Gem', tier: 'gold', metric: 'level', threshold: 20 },
  { id: 'level-30', category: 'milestones', title: 'Nexus Master', description: 'Reach Level 30', icon: 'Medal', tier: 'gold', metric: 'level', threshold: 30 },
  { id: 'xp-1000', category: 'milestones', title: '1,000 XP', description: 'Earn 1,000 total XP', icon: 'Sparkle', tier: 'silver', metric: 'totalXp', threshold: 1000 },
  { id: 'xp-5000', category: 'milestones', title: '5,000 XP', description: 'Earn 5,000 total XP', icon: 'Sparkles', tier: 'gold', metric: 'totalXp', threshold: 5000 },
  { id: 'xp-10000', category: 'milestones', title: '10,000 XP', description: 'Earn 10,000 total XP', icon: 'Stars', tier: 'gold', metric: 'totalXp', threshold: 10000 },

  // ============ SECRET ============
  { id: 'secret-first-achievement', category: 'secret', secret: true, title: 'Achievement Hunter', description: 'Unlock your first achievement', icon: 'Trophy', tier: 'bronze', metric: 'achievementsUnlocked', threshold: 1 },
  { id: 'secret-10-achievements', category: 'secret', secret: true, title: 'Collector', description: 'Unlock 10 achievements', icon: 'Layers', tier: 'silver', metric: 'achievementsUnlocked', threshold: 10 },
  { id: 'secret-25-achievements', category: 'secret', secret: true, title: 'Completionist', description: 'Unlock 25 achievements', icon: 'LayoutGrid', tier: 'gold', metric: 'achievementsUnlocked', threshold: 25 },
  { id: 'secret-all-features', category: 'secret', secret: true, title: 'Explorer', description: 'Add a task, a note, an exam, a quiz, and complete a focus session', icon: 'Compass', tier: 'gold', metric: 'featuresUsedAll', threshold: 1 },
  { id: 'secret-perfect-week', category: 'secret', secret: true, title: 'Perfect Week', description: 'Reach a 7-day streak with at least one task completed each of those days', icon: 'CalendarHeart', tier: 'gold', metric: 'perfectWeek', threshold: 1 },
  { id: 'secret-comeback', category: 'secret', secret: true, title: 'The Comeback', description: 'Start a new streak after losing one', icon: 'RefreshCcw', tier: 'silver', metric: 'streakComebacks', threshold: 1 },
  { id: 'secret-quiz-master-all', category: 'secret', secret: true, title: 'Quiz Grandmaster', description: 'Score 100% on 15 quizzes', icon: 'Crown', tier: 'gold', metric: 'perfectQuizzes', threshold: 15 },
  { id: 'secret-task-100-streak', category: 'secret', secret: true, title: 'Unstoppable', description: 'Reach a 50-day streak and complete 100 tasks', icon: 'Flame', tier: 'gold', metric: 'unstoppable', threshold: 1 }
]

export const CATEGORY_META = {
  streaks: { label: 'Streaks', emoji: '🔥' },
  tasks: { label: 'Tasks', emoji: '✅' },
  schoolwork: { label: 'Schoolwork', emoji: '📚' },
  tests: { label: 'Tests & Quizzes', emoji: '📝' },
  productivity: { label: 'Productivity', emoji: '🎯' },
  organization: { label: 'Organization', emoji: '📅' },
  milestones: { label: 'Milestones', emoji: '🌟' },
  secret: { label: 'Secret', emoji: '🔒' }
}
