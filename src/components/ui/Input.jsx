import { forwardRef } from 'react'
import clsx from 'clsx'

const Input = forwardRef(function Input(
  { className, label, hint, error, icon: Icon, id, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
          />
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full bg-[var(--bg-surface)] border rounded-xl text-sm text-[var(--text-primary)]',
            'placeholder:text-[var(--text-secondary)] transition-all duration-150',
            'py-2.5 outline-none focus:border-signal-600 focus:ring-2 focus:ring-signal-600/20',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--bg-surface-2)]',
            Icon ? 'pl-10 pr-3' : 'px-3',
            error ? 'border-danger' : 'border-[var(--border-subtle)]',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <span className="text-xs text-[var(--text-secondary)]">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
})

export default Input
