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
                        <span>📅</span> Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
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

            <div className="dashboard-bottom-row">
                <div className="stat-widget">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📦</span> Pending Orders
                    </h3>
                    {stats.pendingOrders.length === 0 ? (
                        <p style={{ opacity: 0.6 }}>No pending orders</p>
                    ) : (
                        <div className="recent-list">
                            {stats.pendingOrders.map(order => (
                                <div key={order.id} className="recent-item">
                                    <div className="recent-item-info">
                                        <div className="recent-item-title">{order.asset_name || `Order #${order.id}`}</div>
                                        <div className="recent-item-sub">Req by: {order.requested_by || 'Unknown'}</div>
                                    </div>
                                    <Link to="/vendor-requests" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View</Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="stat-widget">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>✅</span> Completed Orders
                    </h3>
                    {stats.completedOrders.length === 0 ? (
                        <p style={{ opacity: 0.6 }}>No completed orders</p>
                    ) : (
                        <div className="recent-list">
                            {stats.completedOrders.map(order => (
                                <div key={order.id} className="recent-item">
                                    <div className="recent-item-info">
                                        <div className="recent-item-title">{order.asset_name || `Order #${order.id}`}</div>
                                        <div className="recent-item-sub">Delivered on {new Date(order.updated_at).toLocaleDateString()}</div>
                                    </div>
                                    <span className="badge badge-success">Delivered</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

  )
}

export default VendorDashboard
