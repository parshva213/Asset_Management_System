"use client"

import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Register = () => {
  const { role } = useParams()
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    supervisorKey: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const getRoleTitle = () => {
    switch (role) {
      case "super-admin": return "Super Admin"
      case "it-supervisor": return "IT Supervisor"
      case "employee": return "Employee"
      case "vendor": return "Vendor"
      case "maintenance-staff": return "Maintenance Staff"
      default: return "User"
    }
  }

const getRoleEnum = () => {
  switch (role) {
    case "super-admin":
      return "Super Admin";
    case "it-supervisor":
      return "Supervisor";
    case "employee":
      return "Employee";
    case "vendor":
      return "Vendor";
    case "maintenance-staff":
      return "Maintenance";
    default:
      return "Employee";
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const registrationData = { ...formData, role: getRoleEnum() }

    // Remove department for Vendor/Maintenance
    if (role === "vendor" || role === "maintenance-staff") {
      delete registrationData.department
    }

    const result = await register(registrationData)
    if (result.success) navigate("/dashboard")
    else setMessage(result.message)

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register as {getRoleTitle()}</h2>

        {message && (
          <div className={`alert ${message.includes("success") ? "alert-success" : "alert-error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required />
          </div>

          {/* Department only for Admin, Supervisor, Employee */}
          {!(role === "vendor" || role === "maintenance-staff") && (
            <div className="form-group">
              <label className="form-label">Department</label>
              <input type="text" name="department" className="form-input" value={formData.department} onChange={handleChange} />
            </div>
          )}

          {/* IT Supervisor Key */}
          {role === "it-supervisor" && (
            <div className="form-group">
              <label className="form-label">Supervisor Authorization Key</label>
              <input type="text" name="supervisorKey" className="form-input" value={formData.supervisorKey} onChange={handleChange} placeholder="Enter your supervisor key" required />
              <small style={{ color: "#666", fontSize: "12px" }}>Valid keys: SUP2024, ADMIN123, SUPERVISOR001</small>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Phone (Optional)</label>
            <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register