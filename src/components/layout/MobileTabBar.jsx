import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Timer, Sparkles, Menu } from 'lucide-react'
import clsx from 'clsx'
import { useUI } from '../../context/UIContext.jsx'

const tabs = [
  { id: 'dashboard', label: 'Home', path: '/', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { id: 'focus', label: 'Focus', path: '/focus', icon: Timer },
  { id: 'ai', label: 'AI', path: '/ai-assistant', icon: Sparkles }
]

export default function MobileTabBar() {
  const { openMobileNav } = useUI()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-surface)]/90 backdrop-blur-md border-t border-[var(--border-subtle)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-signal-600' : 'text-[var(--text-secondary)]'
                )
              }
            >
              <Icon size={20} />
              {tab.label}
            </NavLink>
          )
        })}
        <button
          onClick={openMobileNav}
          className="flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-medium text-[var(--text-secondary)]"
        >
          <Menu size={20} />
          More
        </button>
      </div>
    </nav>
  )
}
