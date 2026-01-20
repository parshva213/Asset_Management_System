"use client"
import { useEffect, useState, useCallback } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import { formatDate } from "../utils/dateUtils"

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
                <div className="card-header">
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                        alt="Profile"
                        className="profile-avatar"
                    />
                    <div className="profile-info">
                        <h3>Hi, {user?.name} 👋</h3>
                       <span className="badge badge-high">Vendor</span>
                    </div>
                </div>
                <div className="card-body">
                    <div className="profile-detail-item">
                        <span>📧</span> {user?.email}
                    </div>
                    <div className="profile-detail-item">
                        <span>🏢</span> {user?.department || 'External Vendor'}
                    </div>
                    <div className="profile-detail-item">
                        <span>🔑</span> {user?.ownpk || 'Not set'}
                    </div>
                    <div className="profile-detail-item">
                        <span>📞</span> {user?.phone || 'Not set'}
                    </div>
                    <div className="profile-detail-item">
                        <span>📅</span> Joined {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                    </div>
                </div>
                <div className="card-footer">
                    <Link to="/profile">
                        View full details →
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-2">
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{ background: '#f59e0b' }}>
                            📦
                        </div>
                        <div className="stat-title">Pending Orders</div>
                        <div className="stat-value">{stats.pending >= 10 ? `${Math.floor(stats.pending / 10) * 10}+` : stats.pending}</div>
                    </div>
                    <div className="card-footer">
                         <Link to="/vendor-requests">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                            ✅
                        </div>
                        <div className="stat-title">Completed Orders</div>
                        <div className="stat-value">{stats.completed >= 10 ? `${Math.floor(stats.completed / 10) * 10}+` : stats.completed}</div>
                    </div>
                    <div className="card-footer">
                         <Link to="/vendor-requests">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{ background: '#6366f1' }}>
                            🚚
                        </div>
                        <div className="stat-title">Total Supplied</div>
                        <div className="stat-value">{stats.totalSupplied >= 10 ? `${Math.floor(stats.totalSupplied / 10) * 10}+` : stats.totalSupplied}</div>
                    </div>
                    <div className="card-footer">
                         <Link to="/vendor-assets">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{ background: '#06b6d4' }}>
                            🆕
                        </div>
                        <div className="stat-title">Supply Assets</div>
                        <div className="stat-value">{stats.totalSupplied >= 10 ? `${Math.floor(stats.totalSupplied / 10) * 10}+` : stats.totalSupplied}</div>
                    </div>
                    <div className="card-footer">
                         <Link to="/supply-assets">
                            Supply New →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>

  )
}

export default VendorDashboard
