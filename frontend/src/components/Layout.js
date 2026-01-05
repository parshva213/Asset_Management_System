"use client"

import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "./../contexts/AuthContext"
import { useTheme } from "./../contexts/ThemeContext"
import { useMemo } from "react"
import Loading from "./Loading"
import Footer from "./Footer"
import logo from "../img/logo.png"

import ThemeToggle from "./ThemeToggle"

const MENU_ITEMS = {
  "Super Admin": [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Users", path: "/employees" },
    { name: "Categories", path: "/categories" },
    { name: "Locations", path: "/locations" },
    { name: "Assets", path: "/assets" },
    { name: "Purchase Orders", path: "/purchase-orders" },
    { name: "Requests", path: "/requests" },
    { name: "Maintenance Dashboard", path: "/maintenance-dashboard" },
    { name: "Profile", path: "/profile" },
  ],
  "Supervisor": [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Locations", path: "/locations" },
    { name: "Assets", path: "/assets" },
    { name: "Purchase Orders", path: "/purchase-orders" },
    { name: "Requests", path: "/requests" },
    { name: "Profile", path: "/profile" },
  ],
  "Employee": [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Assets", path: "/assets" },
    { name: "Requests", path: "/requests" },
    { name: "Profile", path: "/profile" },
  ],
  "Vendor": [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Vendor Dashboard", path: "/vendor-dashboard" },
    { name: "Supply Assets", path: "/supply-assets" },
    { name: "Warranty Docs", path: "/warranty-docs" },
    { name: "Vendor Assets", path: "/vendor-assets" },
    { name: "Vendor Requests", path: "/vendor-requests" },
    { name: "Profile", path: "/profile" },
  ],
  "Maintenance": [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Maintenance Dashboard", path: "/maintenance-dashboard" },
    { name: "New Configuration", path: "/new-configuration" },
    { name: "Update Maintenance", path: "/update-maintenance" },
    { name: "Maintenance Tasks", path: "/maintenance-tasks" },
    { name: "Profile", path: "/profile" },
  ],
}

const Layout = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()

  // ------------------ ROLE BASED MENUS ------------------
  const currentMenu = useMemo(() => (user ? (MENU_ITEMS[user.role] || []) : []), [user])

  if (!user) {
    return <Loading message="Loading user profile..." />
  }

  return (
    <div className={`layout-container ${theme}`}>
      {/* Global Header */}
      <header className="global-header">
        <div className="header-left">
            <img src={logo} alt="Logo" className="header-logo" />
            <span className="brand-name">Asset Management System</span>
        </div>
        
        <div className="header-center">
            {/* Blank as requested */}
        </div>

        <div className="header-right">
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

      <div className="layout-body">
        {/* Sidebar */}
        <aside className="sidebar">
            {/* Sidebar Header Removed as requested */}
            <nav className="sidebar-nav">
            <ul>
                {currentMenu.map((item, idx) => (
                <li key={idx}>
                    <Link
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                    >
                    {item.name}
                    </Link>
                </li>
                ))}
            </ul>
            </nav>
        </aside>

        {/* Main Content Area */}
        <div className="main-content">
            <main className={`content ${location.pathname.includes('dashboard') ? 'dashboard-content' : ''}`}>
                <Outlet />
            </main>
            <Footer />
        </div>
      </div>
    </div>
  )
}

export default Layout
