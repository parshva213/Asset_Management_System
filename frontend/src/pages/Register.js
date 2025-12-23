"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import api from "../api"
import ThemeToggle from "../components/ThemeToggle"
import Footer from "../components/Footer"

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    phone: ""
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [role, setRole] = useState("")

  useEffect(() => {
    // Get role from state or query param, otherwise redirect to role selection
    if (location.state?.role) {
      setRole(location.state.role)
    } else {
        // Fallback or redirect? Let's redirect if no role is found to ensure flow
       // However, maybe user just typed /register. Let's keep it but show a select or redirect.
       // For now, redirect to role-selection if no role.
       navigate('/role-selection')
    }
  }, [location, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role, // Role Name e.g. "Super Admin"
        department: formData.department,
        phone: formData.phone
      })

      setMessage("Registration successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)
      setMessage(error.response?.data?.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <ThemeToggle />
      </div>
      <div className="auth-card">
        {/* AMS Logo */}
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(to right, #818cf8, #c7d2fe)',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
        }}>
            A
        </div>

        <h2 className="auth-title">Register as {role}</h2>

        {message && (
          <div className={`alert ${message.includes("successful") ? "alert-success" : "alert-error"}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group input-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group input-group">
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

          <div className="form-group input-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group input-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Optional fields based on role could go here, e.g. Department for Employees */}
          {['Employee', 'Supervisor', 'Maintenance Staff'].includes(role) && (
             <div className="form-group input-group">
                <label className="form-label">Department (Optional)</label>
                <input
                type="text"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: '1rem' }} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-link">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p> 
          <p style={{ marginTop: '0.5rem' }}>
             <Link to="/role-selection">Change Role</Link>
          </p>
        </div>
      </div>
      
       {/* Footer */}
       <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <Footer />
       </div>
    </div>
  )
}

export default Register
