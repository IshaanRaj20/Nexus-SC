import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'
import MobileTabBar from './MobileTabBar.jsx'
import { useAchievements } from '../../hooks/useAchievements.js'
import { useUserCollection } from '../../hooks/useUserCollection.js'
import { useDueSoonNotifications } from '../../hooks/useDueSoonNotifications.js'

export default function AppShell() {
  // Runs on every protected page (not just Dashboard/Achievements) so
  // achievement unlocks and due-soon reminders are detected as soon as the
  // underlying data changes, regardless of which page the user is on.
  useAchievements()
  const { items: tasks } = useUserCollection('tasks')
  const { items: exams } = useUserCollection('exams')
  useDueSoonNotifications(tasks, exams)

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  )
}
