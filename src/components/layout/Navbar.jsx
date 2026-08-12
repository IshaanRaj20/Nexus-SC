import { useState, useRef, useEffect } from 'react'
import { Search, Bell, Menu, Sun, Moon, LogOut, Settings as SettingsIcon, User, Trophy, Flame, Clock, X, CheckCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useUI } from '../../context/UIContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../hooks/useNotifications.js'
import { getInitials, getAvatarColor } from '../../lib/userDisplay.js'
import Logo from './Logo.jsx'

const TYPE_ICON = {
  achievement: Trophy,
  'streak-milestone': Flame,
  'streak-loss': Flame,
  'task-due': Clock,
  'exam-due': Clock
}

const TYPE_TONE = {
  achievement: 'text-warning',
  'streak-milestone': 'text-streak',
  'streak-loss': 'text-danger',
  'task-due': 'text-signal-600',
  'exam-due': 'text-signal-600'
}

function timeAgo(createdAt) {
  if (!createdAt?.toDate) return ''
  const diffMs = Date.now() - createdAt.toDate().getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { openMobileNav } = useUI()
  const { currentUser, userProfile, logout } = useAuth()
  const { notifications, unreadCount, markRead, dismiss, dismissAll } = useNotifications()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(profileRef, () => setProfileOpen(false))

  const name = userProfile?.name || currentUser?.displayName || currentUser?.email || 'Student'
  const email = currentUser?.email || ''
  const photoURL = currentUser?.photoURL
  const initials = getInitials(name, email)
  const avatarColor = getAvatarColor(currentUser?.uid || name)

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const handleNotificationClick = (n) => {
    markRead(n.id)
    setNotifOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <header className="sticky top-0 z-20 h-16 shrink-0 bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="h-full flex items-center gap-3 px-4 sm:px-6">
        <button
          onClick={openMobileNav}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--bg-surface-2)]"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="md:hidden">
          <Logo />
        </div>

        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search tasks, notes, courses…"
            className={clsx(
              'w-full bg-[var(--bg-surface-2)] rounded-xl pl-10 pr-4 py-2.5 text-sm',
              'outline-none border border-transparent focus:border-signal-600 focus:bg-[var(--bg-surface)]',
              'transition-colors duration-150 placeholder:text-[var(--text-secondary)]'
            )}
          />
        </div>

        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2.5 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors relative overflow-hidden"
          >
            <Sun size={19} className={clsx('transition-all duration-300', theme === 'dark' ? 'scale-0 rotate-90 absolute' : 'scale-100 rotate-0')} />
            <Moon size={19} className={clsx('transition-all duration-300', theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90 absolute')} />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              className="p-2.5 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors relative"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-[var(--bg-surface)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-card shadow-soft-dark animate-scale-in origin-top-right overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="font-display font-semibold text-sm">Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={dismissAll}
                      className="text-xs font-medium text-signal-600 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={13} /> Dismiss All
                    </button>
                  )}
                </div>
                <ul className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 && (
                    <li className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
                      You're all caught up.
                    </li>
                  )}
                  {notifications.map((n) => {
                    const Icon = TYPE_ICON[n.type] || Bell
                    return (
                      <li
                        key={n.id}
                        className={clsx(
                          'group px-4 py-3 flex items-start gap-3 hover:bg-[var(--bg-surface-2)] cursor-pointer transition-colors relative',
                          !n.read && 'bg-signal-50 dark:bg-signal-900/20'
                        )}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <Icon size={16} className={clsx('shrink-0 mt-0.5', TYPE_TONE[n.type] || 'text-signal-600')} />
                        <div className="min-w-0 flex-1">
                          <p className={clsx('text-sm leading-snug', !n.read && 'font-medium')}>{n.title}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.body}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-signal-600 shrink-0 mt-1.5" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            dismiss(n.id)
                          }}
                          aria-label="Dismiss notification"
                          className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 p-1 pr-1 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors"
              aria-label="User menu"
            >
              {photoURL ? (
                <img src={photoURL} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
              )}
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-card shadow-soft-dark animate-scale-in origin-top-right overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                  <p className="text-sm font-medium truncate">{name}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{email}</p>
                </div>
                <ul className="py-1">
                  <li>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--bg-surface-2)] transition-colors">
                      <User size={16} /> Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--bg-surface-2)] transition-colors">
                      <SettingsIcon size={16} /> Settings
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-[var(--bg-surface-2)] transition-colors">
                      <LogOut size={16} /> Log out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
