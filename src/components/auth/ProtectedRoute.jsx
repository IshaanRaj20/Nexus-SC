import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { PageLoader } from '../ui/Loading.jsx'

export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) return <PageLoader label="Checking your session…" />
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}
