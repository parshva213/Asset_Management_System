"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.some(role => role.toLowerCase() === (user.role || "").toLowerCase())) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
