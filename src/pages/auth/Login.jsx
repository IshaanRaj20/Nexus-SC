import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Chrome } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const { login, loginWithGoogle, authError, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
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
      navigate(redirectTo, { replace: true })
    } catch {
      // authError already holds a friendly message
    } finally {
      setGoogleSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep your streak going."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-signal-600 font-medium hover:underline">
            Sign up
          </Link>
        </>
      }
    >
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
        <div>
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <div className="text-right mt-1.5">
            <Link to="/forgot-password" className="text-xs text-signal-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {authError && (
          <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{authError}</p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
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
    </AuthLayout>
  )
}
