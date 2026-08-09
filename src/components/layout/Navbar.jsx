import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  Settings as SettingsIcon,
  User,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useUI } from '../../context/UIContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  getInitials,
  getAvatarColor,
} from '../../lib/userDisplay.js'
import Logo from './Logo.jsx'

const notifications = [
  {
    id: 1,
    title: 'Problem set 6 due in 3 hours',
    time: '3h',
    tone: 'warning',
  },
  {
    id: 2,
    title: "You're on an 18-day streak! 🔥",
    time: '1d',
    tone: 'success',
  },
  {
    id: 3,
    title: 'New quiz available: Big-O Notation Drill',
    time: '2d',
    tone: 'neutral',
  },
]

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        onOutside()
      }
    }

    document.addEventListener(
      'mousedown',
      handler
    )

    return () =>
      document.removeEventListener(
        'mousedown',
        handler
      )
  }, [ref, onOutside])
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { openMobileNav } = useUI()

  const {
    currentUser,
    userProfile,
    userProfileLoading,
    authLoading,
    logout,
  } = useAuth()

  const navigate = useNavigate()

  const [notifOpen, setNotifOpen] =
    useState(false)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useClickOutside(
    notifRef,
    () => setNotifOpen(false)
  )

  useClickOutside(
    profileRef,
    () => setProfileOpen(false)
  )

  const name =
    userProfile?.name ||
    currentUser?.displayName ||
    currentUser?.email ||
    'Student'

  const email =
    currentUser?.email || ''

  const photoURL =
    userProfile?.photoURL ||
    currentUser?.photoURL ||
    null

  const initials = getInitials(
    name,
    email
  )

  const avatarColor =
    getAvatarColor(
      currentUser?.uid || name
    )

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()

    navigate('/login', {
      replace: true,
    })
  }

  return (
    <header className="h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center px-4 sm:px-6 shrink-0">

      {/* Mobile logo */}
      <div className="md:hidden">
        <Logo />
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
        />

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

      {/* Right side */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Theme */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2.5 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors relative overflow-hidden"
        >
          <Sun
            size={19}
            className={clsx(
              'transition-all duration-300',
              theme === 'dark'
                ? 'scale-0 rotate-90 absolute'
                : 'scale-100 rotate-0'
            )}
          />

          <Moon
            size={19}
            className={clsx(
              'transition-all duration-300',
              theme === 'dark'
                ? 'scale-100 rotate-0'
                : 'scale-0 -rotate-90 absolute'
            )}
          />
        </button>

        {/* Notifications */}
        <div
          className="relative"
          ref={notifRef}
        >
          <button
            onClick={() =>
              setNotifOpen((v) => !v)
            }
            aria-label="Notifications"
            className="p-2.5 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors relative"
          >
            <Bell size={19} />

            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-[var(--bg-surface)]" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-card shadow-soft-dark animate-scale-in origin-top-right overflow-hidden">

              <div className="px-4 py-3 border-b border-[var(--border-subtle)] font-display font-semibold text-sm">
                Notifications
              </div>

              <ul>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="px-4 py-3 flex items-start gap-3 hover:bg-[var(--bg-surface-2)] cursor-pointer transition-colors"
                  >
                    <span
                      className={clsx(
                        'w-2 h-2 rounded-full mt-1.5 shrink-0',
                        n.tone === 'warning' &&
                          'bg-warning',
                        n.tone === 'success' &&
                          'bg-success',
                        n.tone === 'neutral' &&
                          'bg-signal-600'
                      )}
                    />

                    <div className="min-w-0">
                      <p className="text-sm leading-snug">
                        {n.title}
                      </p>

                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {n.time} ago
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div
          className="relative"
          ref={profileRef}
        >
          <button
            onClick={() =>
              setProfileOpen((v) => !v)
            }
            className="flex items-center gap-2 p-1 pr-1 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors"
            aria-label="User menu"
          >
            {authLoading || userProfileLoading ? (
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-3)] animate-pulse" />
            ) : photoURL ? (
              <img
                src={photoURL}
                alt=""
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                style={{
                  backgroundColor:
                    avatarColor,
                }}
              >
                {initials}
              </div>
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-card shadow-soft-dark animate-scale-in origin-top-right overflow-hidden">

              <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                <p className="text-sm font-medium truncate">
                  {name}
                </p>

                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {email}
                </p>
              </div>

              <ul className="py-1">
                <li>
                  <Link
                    to="/profile"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--bg-surface-2)] transition-colors"
                  >
                    <User size={16} />
                    Profile
                  </Link>
                </li>

                <li>
                  <Link
                    to="/settings"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--bg-surface-2)] transition-colors"
                  >
                    <SettingsIcon size={16} />
                    Settings
                  </Link>
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-[var(--bg-surface-2)] transition-colors"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}