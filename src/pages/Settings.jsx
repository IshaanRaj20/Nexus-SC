import { ChevronRight, Sun, Moon, Monitor, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useGamification } from '../hooks/useGamification.js'
import { getInitials, getAvatarColor } from '../lib/userDisplay.js'
import { settingsSections } from '../data/mockData.js'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { currentUser, userProfile, logout } = useAuth()
  const { levelInfo } = useGamification()
  const navigate = useNavigate()

  const name = userProfile?.name || currentUser?.displayName || currentUser?.email || 'Student'
  const email = currentUser?.email || ''
  const photoURL = currentUser?.photoURL
  const initials = getInitials(name, email)
  const avatarColor = getAvatarColor(currentUser?.uid || email)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage your account and app preferences." />

      <Link to="/profile">
        <Card interactive className="p-5 flex items-center gap-4 mb-6">
          {photoURL ? (
            <img src={photoURL} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-semibold shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold truncate">{name}</p>
            <p className="text-sm text-[var(--text-secondary)] truncate">{email}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Level {levelInfo.level} · {levelInfo.totalXp.toLocaleString()} XP</p>
          </div>
          <ChevronRight size={18} className="text-[var(--text-secondary)] shrink-0" />
        </Card>
      </Link>

      <Card className="p-5 mb-6">
        <h3 className="font-display font-semibold text-sm mb-3">Theme</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor }
          ].map((opt) => {
            const Icon = opt.icon
            const active = theme === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => opt.id !== 'system' && setTheme(opt.id)}
                className={clsx(
                  'flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors text-sm font-medium',
                  active ? 'border-signal-600 bg-signal-50 dark:bg-signal-900/30 text-signal-600' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)]'
                )}
              >
                <Icon size={20} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </Card>

      {settingsSections.map((section) => (
        <Card key={section.id} className="mb-6 overflow-hidden">
          <h3 className="font-display font-semibold text-sm px-5 pt-5 pb-2">{section.title}</h3>
          <div>
            {section.items.map((item) => {
              const isAccountItem = section.id === 'account'
              const content = (
                <>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-[var(--text-secondary)] shrink-0" />
                </>
              )
              return isAccountItem ? (
                <Link
                  key={item.id}
                  to="/profile"
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 border-t border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)] transition-colors text-left"
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 border-t border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)] transition-colors text-left"
                >
                  {content}
                </button>
              )
            })}
          </div>
        </Card>
      ))}

      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut size={16} /> Log out
      </Button>
    </div>
  )
}
