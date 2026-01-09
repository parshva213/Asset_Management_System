"use client"

import { useNavigate } from "react-router-dom"

import ThemeToggle from "../components/ThemeToggle"
import Footer from "../components/Footer"
import logo from "../img/logo.png"

const RoleSelection = () => {
  const navigate = useNavigate()

  const roles = [
    { key: "super-admin", title: "Super Admin", description: "Full system access and management capabilities" },
    { key: "it-supervisor", title: "IT Supervisor", description: "Manage assets and supervise employees" },
    { key: "employee", title: "Employee", description: "View assigned assets and submit requests" },
    { key: "vendor", title: "Vendor", description: "Manage purchase orders and asset deliveries" },
    { key: "maintenance-staff", title: "Maintenance Staff", description: "Manage maintenance tasks for assets" },
  ]

  const handleRoleSelect = (role) => {
    navigate(`/register`, { state: { role: role.title } })
  }

  return (
    <div className="auth-wrapper">
        <div className="theme-toggle-wrapper">
            <ThemeToggle />
        </div>
      <div className="role-selection-card">
        {/* AMS Logo */}
        <img src={logo} alt="AMS Logo" className="auth-logo" />
        <h2 className="auth-title">Select Your Role</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "20px" }}>
          Choose the role that best describes your position in the organization
        </p>

        <div className="role-options">
          {roles.map((role) => (
            <div key={role.key} className="role-option" onClick={() => handleRoleSelect(role)}>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>
          ))}
        </div>

        <div className="auth-link">
          <p>
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
      <div className="auth-footer-wrapper">
          <Footer />
      </div>
    </div>
  )
}

export default RoleSelection
