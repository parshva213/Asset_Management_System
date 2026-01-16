import React from "react"
import logo from "../img/logo.png"
import ThemeToggle from "./ThemeToggle"

const Header = ({ user, logout, toggleSidebar }) => {
  return (
    <header className="global-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar} title="Toggle Sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="brand-container">
          <img src={logo} alt="Logo" className="header-logo" />
          <span className="brand-name">IT Asset Management System</span>
        </div>
      </div>
      
      {/* Center div removed as logo moved to left */}

      <div className="header-right">
        {console.log("Header User Data:", user)}
        {user.organization_name ? (
          <span className="organization-name">{user.organization_name}</span>
        ) : (
          <span className="organization-name" style={{ color: 'orange' }}>No Org Assigned</span>
        )}
        <div className="user-profile">
          <span className="user-name">{user.name}</span>
          <span className="user-role">({user.role})</span>
        </div>
        <ThemeToggle />
        <button 
          onClick={logout} 
          className="btn btn-danger" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
