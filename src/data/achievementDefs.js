// Every achievement is defined by which counter it reads (from the
// gamification document — see useGamification.js) and the threshold that
// unlocks it. Nothing here is hand-toggled; Achievements.jsx computes
// unlocked/progress for all of these from real data every render.

export const ACHIEVEMENT_DEFS = [
  // --- Tasks ---
  { id: 'task-1', title: 'First Steps', description: 'Complete your first task', icon: 'Footprints', tier: 'bronze', metric: 'tasksCompleted', threshold: 1 },
  { id: 'task-10', title: 'Getting Things Done', description: 'Complete 10 tasks', icon: 'CheckCircle2', tier: 'bronze', metric: 'tasksCompleted', threshold: 10 },
  { id: 'task-25', title: 'Task Master', description: 'Complete 25 tasks', icon: 'ListChecks', tier: 'silver', metric: 'tasksCompleted', threshold: 25 },
  { id: 'task-50', title: 'Task Legend', description: 'Complete 50 tasks', icon: 'Award', tier: 'silver', metric: 'tasksCompleted', threshold: 50 },
  { id: 'task-100', title: 'Century Club', description: 'Complete 100 tasks', icon: 'Trophy', tier: 'gold', metric: 'tasksCompleted', threshold: 100 },

  // --- Notes ---
  { id: 'note-10', title: 'Note Taker', description: 'Create 10 notes', icon: 'NotebookPen', tier: 'bronze', metric: 'notesCreated', threshold: 10 },
  { id: 'note-25', title: 'Prolific Writer', description: 'Create 25 notes', icon: 'PenLine', tier: 'silver', metric: 'notesCreated', threshold: 25 },
  { id: 'note-50', title: 'Archivist', description: 'Create 50 notes', icon: 'BookOpen', tier: 'gold', metric: 'notesCreated', threshold: 50 },

  // --- Exams ---
  { id: 'exam-1', title: 'Planner', description: 'Add your first exam', icon: 'CalendarPlus', tier: 'bronze', metric: 'examsAdded', threshold: 1 },
  { id: 'exam-5', title: 'Exam Ready', description: 'Add 5 exams', icon: 'GraduationCap', tier: 'silver', metric: 'examsAdded', threshold: 5 },

  // --- Quizzes ---
  { id: 'quiz-1', title: 'Quiz Taker', description: 'Take your first quiz', icon: 'Brain', tier: 'bronze', metric: 'quizzesTaken', threshold: 1 },
  { id: 'quiz-10', title: 'Quiz Regular', description: 'Take 10 quizzes', icon: 'BrainCircuit', tier: 'silver', metric: 'quizzesTaken', threshold: 10 },
  { id: 'quiz-perfect-1', title: 'Quiz Champion', description: 'Score 100% on a quiz', icon: 'Trophy', tier: 'gold', metric: 'perfectQuizzes', threshold: 1 },
  { id: 'quiz-perfect-5', title: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: 'Sparkles', tier: 'gold', metric: 'perfectQuizzes', threshold: 5 },

  // --- Focus sessions ---
  { id: 'focus-1', title: 'First Focus', description: 'Complete your first focus session', icon: 'Target', tier: 'bronze', metric: 'focusSessions', threshold: 1 },
  { id: 'focus-10', title: 'Focus Regular', description: 'Complete 10 focus sessions', icon: 'Timer', tier: 'silver', metric: 'focusSessions', threshold: 10 },
  { id: 'focus-25', title: 'Focus Master', description: 'Complete 25 focus sessions', icon: 'Crosshair', tier: 'gold', metric: 'focusSessions', threshold: 25 },
  { id: 'focus-50', title: 'Deep Work', description: 'Complete 50 focus sessions', icon: 'Hourglass', tier: 'gold', metric: 'focusSessions', threshold: 50 },

  // --- Streaks ---
  { id: 'streak-3', title: '3-Day Streak', description: 'Study 3 days in a row', icon: 'Flame', tier: 'bronze', metric: 'streakDays', threshold: 3 },
  { id: 'streak-7', title: '7-Day Streak', description: 'Study 7 days in a row', icon: 'Flame', tier: 'silver', metric: 'streakDays', threshold: 7 },
  { id: 'streak-14', title: '14-Day Streak', description: 'Study 14 days in a row', icon: 'Flame', tier: 'silver', metric: 'streakDays', threshold: 14 },
  { id: 'streak-30', title: '30-Day Streak', description: 'Study 30 days in a row', icon: 'Flame', tier: 'gold', metric: 'streakDays', threshold: 30 },
  { id: 'streak-60', title: '60-Day Streak', description: 'Study 60 days in a row', icon: 'Flame', tier: 'gold', metric: 'streakDays', threshold: 60 },

  // --- Level milestones ---
  { id: 'level-5', title: 'Rising Star', description: 'Reach Level 5', icon: 'Star', tier: 'silver', metric: 'level', threshold: 5 },
  { id: 'level-10', title: 'Nexus Veteran', description: 'Reach Level 10', icon: 'Crown', tier: 'gold', metric: 'level', threshold: 10 },
  { id: 'level-20', title: 'Nexus Legend', description: 'Reach Level 20', icon: 'Gem', tier: 'gold', metric: 'level', threshold: 20 }
]
