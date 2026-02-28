"use client"
import { useEffect, useState, useCallback } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

const VendorDashboard = () => {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({ 
      pending: 0, 
      completed: 0, 
      totalSupplied: 0,
      pendingOrders: [],
      completedOrders: []
  })

  /* Dashboard State */

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get("/vendor/dashboard")
      const data = response.data
      setStats({
        pending: data.pendingCount || 0,
        completed: data.completedCount || 0,
        totalSupplied: data.totalSupplied || 0,
        pendingOrders: data.pendingOrders || [],
        completedOrders: data.completedOrders || []
      })
    } catch (err) {
      if (err.response?.status === 403) {
        logout()
      } else {
        console.error(err)
      }
    }
  }, [logout])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="dashboard-layout vendor-dashboard">

        <div className="dashboard-top-row">
            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-circle">
                        {user ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "V"}
                    </div>
                    <div className="profile-greeting">
                        <h3>Hi, {user?.name}</h3>
                        <span className="waving-hand">👋</span>
                        <span className="role-badge">Vendor</span>
                    </div>
                </div>
                <div className="profile-details">
                    <div className="info-row">
                        <span className="info-icon">📧</span> {user?.email}
                    </div>
                    <div className="info-row">
                        <span className="info-icon">📞</span> {user?.phone || 'Not set'}
                    </div>
                    <div className="info-row">
                        <span className="info-icon">🔑</span> {user?.ownpk || 'N/A'}
                    </div>
                    <div className="info-row">
                        <span className="info-icon">🛡️</span> {user?.role}
                    </div>
                    <div className="info-row">
                        <span className="info-icon">📅</span> Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                </div>
                <div className="profile-footer">
                    <Link to="/profile">Edit Profile →</Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-2">
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon purple">
                            📋
                        </div>
                        <span className="stat-label">Pending Orders</span>
                        <h3 className="stat-value">
                            {stats.pendingOrders.length > 0 ? stats.pendingOrders.length : 0}
                        </h3>
                    </div>
                   <div className="stat-footer">
                         <Link to="/supply-assets">
                            Manage Orders →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon green">
                             ✅
                        </div>
                        <span className="stat-label">Completed Orders</span>
                        <h3 className="stat-value">
                            {stats.completedOrders.length > 0 ? stats.completedOrders.length : 0}
                        </h3>
                    </div>
                     <div className="stat-footer">
                         <Link to="/vendor-assets">
                            View Products →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon blue">
                            📦
                        </div>
                         <span className="stat-label">Total Supplied</span>
                        <h3 className="stat-value">
                           {stats.totalSupplied > 0 ? stats.totalSupplied : 0}
                        </h3>
                    </div>
                     <div className="stat-footer">
                         <span>Lifetime stats</span>
                    </div>
                </div>
                <div className="stat-widget">
                     <div>
                        <div className="stat-icon orange">
                             ⭐
                        </div>
                        <span className="stat-label">Rating</span>
                        <h3 className="stat-value">
                            4.8
                        </h3>
                     </div>
                      <div className="stat-footer">
                         <span>Based on reviews</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

  )
}

export default VendorDashboard
