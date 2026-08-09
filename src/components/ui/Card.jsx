import clsx from 'clsx'

export default function Card({ children, className, as: Tag = 'div', interactive = false, ...props }) {
  return (
    <Tag
      className={clsx(
        'bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-card',
        'shadow-soft dark:shadow-soft-dark transition-all duration-200',
        interactive && 'hover:-translate-y-0.5 hover:shadow-glow cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={clsx('flex items-start justify-between gap-3 p-5 pb-3', className)}>
      <div>
        <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ children, className }) {
  return <div className={clsx('px-5 pb-5', className)}>{children}</div>
}
