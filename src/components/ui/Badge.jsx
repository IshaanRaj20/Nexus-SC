import clsx from 'clsx'

const tones = {
  neutral: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]',
  blue: 'bg-signal-100 text-signal-700 dark:bg-signal-900/40 dark:text-signal-300',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  streak: 'bg-streak/10 text-streak'
}

export default function Badge({ children, tone = 'neutral', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-pill',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value = 0, className, tone = 'blue' }) {
  const barTones = {
    blue: 'bg-signal-600',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger'
  }
  return (
    <div className={clsx('w-full h-2 rounded-pill bg-[var(--bg-surface-2)] overflow-hidden', className)}>
      <div
        className={clsx('h-full rounded-pill transition-all duration-500 ease-out', barTones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
