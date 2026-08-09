import { forwardRef } from 'react'
import clsx from 'clsx'

const variants = {
  primary:
    'bg-signal-600 text-white hover:bg-signal-700 active:bg-signal-800 shadow-soft disabled:bg-signal-300',
  secondary:
    'bg-[var(--bg-surface-2)] text-[var(--text-primary)] hover:brightness-95 dark:hover:brightness-110 border border-[var(--border-subtle)]',
  ghost:
    'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]',
  danger:
    'bg-danger text-white hover:brightness-95 shadow-soft',
  outline:
    'bg-transparent border border-signal-600 text-signal-600 hover:bg-signal-50 dark:hover:bg-signal-900/30'
}

const sizes = {
  sm: 'text-sm px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-base px-5 py-3 gap-2 rounded-xl',
  icon: 'p-2.5 rounded-xl'
}

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className, disabled, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
