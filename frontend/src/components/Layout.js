"use client"

import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "./../contexts/AuthContext"
import { useTheme } from "./../contexts/ThemeContext"
import { useMemo, useState, useEffect } from "react"
import Loading from "./Loading"
import Footer from "./Footer"

import ThemeToggle from "./ThemeToggle"

const MENU_ITEMS = {
  "Super Admin": [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Employees", path: "/employees" },
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
    <div className={`layout ${theme}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
           <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* AMS Logo PlaceHolder - circle */}
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(to right, #818cf8, #c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>A</div>
              Asset Manager
           </div>
        </div>
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
        <div className="sidebar-footer" style={{ padding: "1.5rem" }}>
          <button className="btn btn-danger" style={{ width: '100%' }} onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div className="header-title">
            {currentMenu.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </div>
          <div className="header-actions">
            <ThemeToggle style={{ marginRight: '1rem' }} />
            <div className="user-info">
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              <span style={{ opacity: 0.7 }}>({user.role})</span>
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
