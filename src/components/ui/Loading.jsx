import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export function Spinner({ size = 20, className }) {
  return <Loader2 size={size} className={clsx('animate-spin text-signal-600', className)} />
}

export function Skeleton({ className }) {
  return <div className={clsx('skeleton rounded-lg', className)} />
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-card p-5 flex flex-col gap-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-[var(--text-secondary)]">
      <Spinner size={28} />
      <p className="text-sm">{label}</p>
    </div>
  )
}
