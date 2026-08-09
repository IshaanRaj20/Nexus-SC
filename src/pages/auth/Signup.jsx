import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Chrome } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Signup() {
  const { signup, loginWithGoogle, authError, clearError } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setFormError('Password should be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      await signup(name, email, password)
      navigate('/', { replace: true })
    } catch {
      // authError already holds a friendly message
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleSubmitting(true)
    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch {
      // authError already holds a friendly message
    } finally {
      setGoogleSubmitting(false)
    }
  }

  const error = formError || authError

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Organize classes, tasks, and study time in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-signal-600 font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        onFocus={() => {
          setFormError(null)
          clearError()
        }}
        className="flex flex-col gap-4"
      >
        <Input
          label="Full name"
          icon={User}
          placeholder="Maya Chen"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
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
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Input
          label="Confirm password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
        <span className="text-xs text-[var(--text-secondary)]">OR</span>
        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
      </div>

      <Button variant="secondary" className="w-full" onClick={handleGoogle} disabled={googleSubmitting}>
        <Chrome size={18} /> {googleSubmitting ? 'Connecting…' : 'Continue with Google'}
      </Button>

      <p className="text-xs text-[var(--text-secondary)] text-center mt-5">
        By continuing, you agree to Nexus&apos;s Terms of Service and Privacy Policy.
      </p>
    </AuthLayout>
  )
}
