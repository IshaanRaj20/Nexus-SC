import {
  LayoutDashboard,
  CheckSquare,
  NotebookPen,
  Calendar,
  Timer,
  GraduationCap,
  Sparkles,
  Brain,
  Trophy,
  Settings
} from 'lucide-react'

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { id: 'notes', label: 'Notes', path: '/notes', icon: NotebookPen },
  { id: 'calendar', label: 'Calendar', path: '/calendar', icon: Calendar },
  { id: 'focus', label: 'Focus Timer', path: '/focus', icon: Timer },
  { id: 'exams', label: 'Exams', path: '/exams', icon: GraduationCap },
  { id: 'ai', label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
  { id: 'quizzes', label: 'Quizzes', path: '/quizzes', icon: Brain },
  { id: 'achievements', label: 'Achievements', path: '/achievements', icon: Trophy },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings }
]
