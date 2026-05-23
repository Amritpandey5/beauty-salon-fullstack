import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

export default function ProtectedRoute({ children,allowedRoles=[] }) {
  const { isAuthenticated, loading,user } = useAuth()
  const location = useLocation()

  if (loading) return <Loader fullScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if(
    // Optional: Add role-based access control
    allowedRoles.length > 0 && 
    !allowedRoles.includes(user?.role)
  ){
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
