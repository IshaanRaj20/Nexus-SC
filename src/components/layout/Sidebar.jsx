import { NavLink } from 'react-router-dom'
import { ChevronsLeft, X, Flame } from 'lucide-react'
import clsx from 'clsx'
import Logo from './Logo.jsx'
import { navItems } from '../../data/navigation.js'
import { useUI } from '../../context/UIContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useUserCollection } from '../../hooks/useUserCollection.js'
import { useGamification } from '../../hooks/useGamification.js'
import { getInitials, getAvatarColor } from '../../lib/userDisplay.js'

function NavItem({ item, collapsed, onClick, badge }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          'hover:bg-[var(--bg-surface-2)]',
          isActive
            ? 'bg-signal-600 text-white hover:bg-signal-600 shadow-soft'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon size={19} className="shrink-0" />
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      {!collapsed && badge > 0 && (
        <span className="text-[11px] font-semibold bg-white/20 rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
          {badge}
        </span>
      )}
      {collapsed && badge > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-streak" />}
    </NavLink>
  )
}

function SidebarContent({ collapsed, onNavigate }) {
  const { currentUser, userProfile } = useAuth()
  const { items: tasks } = useUserCollection('tasks')
  const { data: gamification } = useGamification()
  const pendingTasks = tasks.filter((t) => !t.done).length
  const name = userProfile?.name || currentUser?.displayName || currentUser?.email || 'Student'
  const photoURL = currentUser?.photoURL
  const initials = getInitials(name, currentUser?.email)
  const avatarColor = getAvatarColor(currentUser?.uid || name)

  return (
    <div className="flex flex-col h-full">
      <div className={clsx('flex items-center px-3 h-16 shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-2.5 flex flex-col gap-1 py-2">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            onClick={onNavigate}
            badge={item.id === 'tasks' ? pendingTasks : 0}
          />
        ))}
      </nav>

      <div className={clsx('p-3 border-t border-[var(--border-subtle)] shrink-0')}>
        <div
          className={clsx(
            'flex items-center gap-2.5 rounded-xl bg-[var(--bg-surface-2)] p-2.5',
            collapsed && 'justify-center'
          )}
        >
          {photoURL ? (
            <img src={photoURL} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{name}</p>
              <div className="flex items-center gap-1 text-xs text-streak font-medium">
                <Flame size={12} />
                <span>{gamification.streakDays} day streak</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, closeMobileNav } = useUI()

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col shrink-0 h-screen sticky top-0 z-30',
          'bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]',
          'transition-[width] duration-300 ease-in-out',
          sidebarCollapsed ? 'w-[76px]' : 'w-64'
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={clsx(
            'absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
            'flex items-center justify-center shadow-soft hover:bg-[var(--bg-surface-2)] transition-transform duration-300'
          )}
        >
          <ChevronsLeft size={13} className={clsx('transition-transform duration-300', sidebarCollapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile drawer */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 z-50 transition-opacity duration-300',
          mobileNavOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={closeMobileNav} />
        <aside
          className={clsx(
            'absolute left-0 top-0 h-full w-72 bg-[var(--bg-surface)] shadow-soft-dark',
            'transition-transform duration-300 ease-out flex flex-col',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <button
            onClick={closeMobileNav}
            aria-label="Close menu"
            className="absolute right-3 top-4 p-2 rounded-lg hover:bg-[var(--bg-surface-2)]"
          >
            <X size={20} />
          </button>
          <SidebarContent collapsed={false} onNavigate={closeMobileNav} />
        </aside>
      </div>
    </>
  )
}
