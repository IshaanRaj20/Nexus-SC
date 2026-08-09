// What's left here is content with no real backend of its own yet: the AI
// Assistant's demo conversation. Everything else — tasks, notes, exams,
// quizzes, focus durations, and now gamification (XP/level/streak/
// achievements) — is real, per-user Firestore data. See
// src/hooks/useUserCollection.js and src/hooks/useGamification.js.

export const aiConversation = [
  {
    id: 'm1',
    role: 'assistant',
    text: "Hi! I'm your Nexus AI study assistant. Ask me to explain a concept, summarize your notes, or help plan your week. (This chat is a placeholder until an AI provider is connected — see Settings.)"
  }
]

export const settingsSections = [
  {
    id: 'account',
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile information', description: 'Name, email, and program details' },
      { id: 'password', label: 'Password & security', description: 'Manage your login credentials' }
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance',
    items: [
      { id: 'theme', label: 'Theme', description: 'Light, dark, or match system' },
      { id: 'accent', label: 'Accent color', description: 'Personalize your Nexus blue' }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    items: [
      { id: 'reminders', label: 'Task reminders', description: 'Get notified before deadlines' },
      { id: 'streak', label: 'Streak alerts', description: "Don't lose your daily streak" }
    ]
  }
]
