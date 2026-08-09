export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
