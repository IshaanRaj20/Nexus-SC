import { Routes, Route } from 'react-router-dom'
import { UIProvider } from './context/UIContext.jsx'
import AppShell from './components/layout/AppShell.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute.jsx'

import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'

import Dashboard from './pages/Dashboard.jsx'
import Tasks from './pages/Tasks.jsx'
import Notes from './pages/Notes.jsx'
import CalendarPage from './pages/Calendar.jsx'
import FocusTimer from './pages/FocusTimer.jsx'
import Exams from './pages/Exams.jsx'
import AIAssistant from './pages/AIAssistant.jsx'
import Quizzes from './pages/Quizzes.jsx'
import Achievements from './pages/Achievements.jsx'
import Profile from './pages/Profile.jsx'
import SettingsPage from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <UIProvider>
      <Routes>
        {/* Public, auth-only routes — redirect to the app if already logged in */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

        {/* Everything else requires a signed-in user */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/focus" element={<FocusTimer />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </UIProvider>
  )
}
