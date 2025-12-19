"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: "" })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { login, forgotPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Optionally fetch role from backend before login (if needed)
    // const roleResponse = await fetch(`http://localhost:5000/api/users/role?email=${encodeURIComponent(formData.email)}`)
    // const roleData = await roleResponse.json()
    // console.log("Role from backend:", roleData.role)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      // You can use role from login response or from roleData if fetched before login
      navigate(result.redirectPath || "/dashboard")
    } else {
      setMessage(result.message)
    }

    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const result = await forgotPassword(forgotPasswordData.email)
    setMessage(result.message)
    setLoading(false)

    if (result.success) {
      setTimeout(() => {
        setShowForgotPassword(false)
        setForgotPasswordData({ email: "" })
      }, 3000)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({ ...forgotPasswordData, [e.target.name]: e.target.value })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{showForgotPassword ? "Reset Password" : "Login to AMS"}</h2>

        {message && (
          <div className={`alert ${message.includes("success") ? "alert-success" : "alert-error"}`}>{message}</div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={forgotPasswordData.email}
                onChange={handleForgotPasswordChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </form>
        )}

        <div className="forgot-password-form">
          <button
            type="button"
            className="forgot-password-toggle"
            onClick={() => {
              setShowForgotPassword(!showForgotPassword)
              setMessage("")
            }}
          >
            {showForgotPassword ? "Back to Login" : "Forgot Password?"}
          </button>
        </div>

        <div className="auth-link">
          <p>
            Don't have an account? <Link to="/role-selection">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
