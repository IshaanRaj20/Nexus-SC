import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { PageLoader } from '../ui/Loading.jsx'

export default function PublicOnlyRoute({ children }) {
  const { currentUser, authLoading } = useAuth()

  if (authLoading) return <PageLoader label="Loading…" />
  if (currentUser) return <Navigate to="/" replace />
  return children
}
