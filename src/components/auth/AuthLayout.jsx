import Logo from '../layout/Logo.jsx'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4 py-10">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-card shadow-soft dark:shadow-soft-dark p-6 sm:p-8">
          <h1 className="font-display font-bold text-2xl text-center text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-secondary)] text-center mt-2">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="text-center mt-6 text-sm text-[var(--text-secondary)]">{footer}</div>}
      </div>
    </div>
  )
}
