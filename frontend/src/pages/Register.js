"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import api from "../api"
import ThemeToggle from "../components/ThemeToggle"
import Footer from "../components/Footer"
import logo from "../img/logo.png"

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [role, setRole] = useState("")
  // Validation States
  const [validations, setValidations] = useState({
      name: null,
      email: null,
      password: null,
      confirm: null,
      department: null,
      phone: null
  })

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

  // Real-time Validation Effect
  // Real-time Validation Effect
  useEffect(() => {
      setValidations({
          name: formData.name.trim().length >= 2,
          email: formData.email.includes('@') && formData.email.includes('.'),
          password: formData.password.length >= 6,
          confirm: formData.password === formData.confirmPassword,
          phone: formData.phone.length === 10,
          department: role !== 'Vendor' ? formData.department.trim().length >= 2 : true // Optional field
      })
  }, [formData, role])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match")
      return
    } else if (!validations.name || !validations.email || !validations.password || !validations.confirm || !validations.phone) {
      setMessage("Please fill all the fields correctly")
      return
    }
    if (!formData.name || !formData.email || !formData.password || !formData.phone)
    setMessage("All fields are required");

    setLoading(true)
    setMessage("")

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role, // Role Name e.g. "Super Admin"
        department: formData.department || "",
        phone: formData.phone,
        orgId: location.state?.orgId,
        unpk: location.state?.regKey || ""
      })

      setMessage("Registration successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)
      setMessage(error.response?.data?.message || "Failed to register")
      setTimeout(() => {
        navigate("/role-selection")
      }, 1500);
    } finally {
      setLoading(false)
    }
  }

  const getInputClass = (fieldName) => {
      if (formData[fieldName] === '') return 'form-input'; // Initial state
      // Special case for confirm password, needs second field check
      if (fieldName === 'confirmPassword') {
          return `form-input ${validations.confirm ? 'input-valid' : formData.confirmPassword ? 'input-invalid' : ''}`
      }
      return `form-input ${validations[fieldName] ? 'input-valid' : 'input-invalid'}`
  }

  return (
    <div className="auth-wrapper">
      <div className="theme-toggle-wrapper">
          <ThemeToggle />
      </div>
      <div className="auth-card">
        {/* AMS Logo */}
        <img src={logo} alt="AMS Logo" className="auth-logo" />

        <h2 className="auth-title">Register as {role}</h2>
        {location.state?.orgName && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '-1rem' }}>
            Joining: <strong>{location.state.orgName}</strong>
          </p>
        )}

        {message && (
          <div className={`alert ${message.includes("successful") ? "alert-success" : "alert-error"}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group input-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className={getInputClass('name')}
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group input-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={getInputClass('email')}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group input-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={getInputClass('password')}
              value={formData.password}
              onChange={handleChange}
              minLength={6}
            />
          </div>

          <div className="form-group input-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className={getInputClass('confirmPassword')}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Optional fields based on role could go here, e.g. Department for Employees */}
          {['Employee', 'Supervisor', 'Maintenance Staff', 'IT Supervisor'].includes(role) && (
             <div className="form-group input-group">
                <label className="form-label">Department (Optional)</label>
                <input
                type="text"
                name="department"
                className="form-input" // Optional, no validation needed
                value={formData.department}
                onChange={handleChange}
                />
            </div>
          )}

          <div className="form-group input-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className={getInputClass('phone')}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              minLength={10}
              maxLength={10}
            />
          </div>

          {role === 'Vendor' && (
             <div className="form-group input-group">
                <label className="form-label">Company Name</label>
                <input
                type="text"
                name="department" // Reusing department field for company name for vendors
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
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
       <div className="auth-footer-wrapper">
          <Footer />
       </div>
    </div>
  )
}

export default Register
