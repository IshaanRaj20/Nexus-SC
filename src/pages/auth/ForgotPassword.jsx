import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ForgotPassword() {
  const { resetPassword, authError, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      // authError already holds a friendly message
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={sent ? undefined : "We'll send you a link to reset it."}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-signal-600 font-medium hover:underline">
          <ArrowLeft size={15} /> Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 size={26} className="text-success" />
          </div>
          <p className="text-sm text-[var(--text-primary)]">
            If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
          </p>
          <p className="text-xs text-[var(--text-secondary)]">Check your inbox and spam folder.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} onFocus={clearError} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          {authError && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{authError}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
