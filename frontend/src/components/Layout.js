"use client"

import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "./../contexts/AuthContext"
import { useTheme } from "./../contexts/ThemeContext"
import { useMemo, useState } from "react"
import Loading from "./Loading"
import Footer from "./Footer"
import logo from "../img/logo.png"

import ThemeToggle from "./ThemeToggle"

// Basic SVG Icon Components
const ICONS = {
    dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    ),
    users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    ),
    categories: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
    ),
    locations: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    ),
    assets: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
    ),
    orders: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
    ),
    requests: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    ),
    maintenance: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
    ),
    profile: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    ),
    vendor: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    ),
    file: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ),
    settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    )
};

const MENU_ITEMS = {
  "Super Admin": [
    { name: "Dashboard", path: ["/admin-dashboard"], icon: "dashboard" },
    { name: "Users", path: ["/employees"], icon: "users" },
    { name: "Categories", path: ["/categories"], icon: "categories" },
    { name: "Locations", path: ["/locations","/rooms?locationId="], icon: "locations" },
    { name: "Assets", path: ["/assets"], icon: "assets" },
    { name: "Orders", path: ["/purchase-orders"], icon: "orders" },
    { name: "Requests", path: ["/requests"], icon: "requests" },
    { name: "Maintenance", path: ["/maintenance-dashboard"], icon: "maintenance" },
    { name: "Profile", path: ["/profile"], icon: "profile" },
  ],
  "Supervisor": [
    { name: "Dashboard", path: ["/dashboard"], icon: "dashboard" },
    { name: "Locations", path: ["/locations"], icon: "locations" },
    { name: "Assets", path: ["/assets"], icon: "assets" },
    { name: "Orders", path: ["/purchase-orders"], icon: "orders" },
    { name: "Requests", path: ["/requests"], icon: "requests" },
    { name: "Profile", path: ["/profile"], icon: "profile" },
  ],
  "Employee": [
    { name: "Dashboard", path: ["/dashboard"], icon: "dashboard" },
    { name: "Assets", path: ["/assets"], icon: "assets" },
    { name: "Requests", path: ["/requests"], icon: "requests" },
    { name: "Profile", path: ["/profile"], icon: "profile" },
  ],
  "Vendor": [
    { name: "Dashboard", path: ["/dashboard"], icon: "dashboard" },
    { name: "My Dashboard", path: ["/vendor-dashboard"], icon: "vendor" },
    { name: "Supply", path: ["/supply-assets"], icon: "assets" },
    { name: "Warranty", path: ["/warranty-docs"], icon: "file" },
    { name: "Products", path: ["/vendor-assets"], icon: "assets" },
    { name: "Requests", path: ["/vendor-requests"], icon: "requests" },
    { name: "Profile", path: ["/profile"], icon: "profile" },
  ],
  "Maintenance": [
    { name: "Dashboard", path: ["/dashboard"], icon: "dashboard" },
    { name: "Main. Dash", path: ["/maintenance-dashboard"], icon: "maintenance" },
    { name: "Config", path: ["/new-configuration"], icon: "settings" },
    { name: "Update", path: ["/update-maintenance"], icon: "maintenance" },
    { name: "Tasks", path: ["/maintenance-tasks"], icon: "file" },
    { name: "Profile", path: ["/profile"], icon: "profile" },
  ],
}



// ... (ICONS constant remains same, skipping for brevity in replacement if possible, but replace_file_content needs exact match usually. 
// Actually I can target the component start line to update imports and component body.)

// I will do it in chunks. first imports.
// Wait, I can do it in one go if I target the component definition.

const Layout = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

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
            <img src={logo} alt="Logo" className="header-logo" onClick={toggleSidebar} style={{ cursor: 'pointer' }} title="Toggle Sidebar" />
            <span className="brand-name">IT Asset Management System</span>
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
        <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
            {/* Sidebar Header Removed as requested */}
            <nav className="sidebar-nav">
            <ul>
                {currentMenu.map((item, idx) => {
                    const Icon = ICONS[item.icon] || ICONS.file;
                    return (
                        <li key={idx}>
                            <Link
                            to={item.path[0]}
                            className={
                                item.path.some(p => 
                                    location.pathname === p || 
                                    location.pathname === p.split('?')[0]
                                ) ? 'active' : ''
                            }
                            >
                            <span className="sidebar-icon">
                                <Icon />
                            </span>
                            <span className="sidebar-text">{item.name}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
            </nav>
        </aside>

        {/* Main Content Area */}
        <div className={`main-content ${location.pathname.includes('dashboard') ? 'dashboard-mode' : ''}`}>
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
