import clsx from 'clsx'

export default function Logo({ collapsed = false, className }) {
  return (
    <div className={clsx('flex items-center gap-2.5', className)}>
      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center">
        <img
          src="/favicon.svg"
          alt="Nexus Student Companion Logo"
          className="w-9 h-9 object-contain"
        />
      </div>
      {!collapsed && (
        <span className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)] leading-tight">
          Nexus Student Companion
        </span>
      )}
    </div>
  )
}
