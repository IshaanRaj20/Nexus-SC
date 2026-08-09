import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Button from '../components/ui/Button.jsx'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-signal-100 dark:bg-signal-900/40 flex items-center justify-center mb-4">
        <Compass size={28} className="text-signal-600" />
      </div>
      <h1 className="font-display font-bold text-2xl">Page not found</h1>
      <p className="text-[var(--text-secondary)] mt-2 max-w-sm">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/">
        <Button className="mt-6">Back to dashboard</Button>
      </Link>
    </div>
  )
}
