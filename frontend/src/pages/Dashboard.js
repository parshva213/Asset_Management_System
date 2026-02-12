"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (user) {
      setRedirecting(true)
      switch (user.role) {
        case "Super Admin":
          navigate("/dashboard/admin", { replace: true })
          break
        case "Supervisor":
          navigate("/dashboard/supervisor", { replace: true })
          break
        case "Employee":
          navigate("/dashboard/employee", { replace: true })
          break
        case "Vendor":
          navigate("/dashboard/vendor", { replace: true })
          break
        case "Maintenance":
          navigate("/dashboard/maintenance", { replace: true })
          break
        case "Software Developer":
          navigate("/organizations", { replace: true })
          break
        default:
          navigate("/login", { replace: true })
      }
    } else {
      navigate("/login", { replace: true })
    }
  }, [user, navigate])

  if (redirecting) {
    return <div>Redirecting to your dashboard...</div>
  }

  return <div>Loading user information...</div>
}

export default Dashboard
