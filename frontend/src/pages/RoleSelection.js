"use client"

import { useNavigate } from "react-router-dom"

import ThemeToggle from "../components/ThemeToggle"

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
    <div className="role-selection-container" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
            <ThemeToggle />
        </div>
      <div className="role-selection-card">
        <h2 className="auth-title">Select Your Role</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
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
    </div>
  )
}

export default RoleSelection
