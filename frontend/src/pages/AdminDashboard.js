"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        totalAssets: 0,
        assignedAssets: 0,
        availableAssets: 0,
        pendingRequests: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalLocations: 0,
        totalRooms: 0,
    })
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        try {
            // Parallel fetch for efficiency
            const [dashboardRes] = await Promise.allSettled([
                api.get("/admin/dashboard")
            ])
            
            // Handle Dashboard Stats
            if (dashboardRes.status === 'fulfilled') {
                const data = dashboardRes.value.data
                setStats({
                    totalAssets: data.totalAssets || 0,
                    assignedAssets: data.assignedAssets || 0,
                    availableAssets: data.availableAssets || 0,
                    pendingRequests: data.pendingRequests || 0,
                    totalUsers: data.totalUsers || 0,
                    totalCategories: data.totalCategories || 0,
                    totalLocations: data.totalLocations || 0,
                    totalRooms: data.totalRooms || 0,
                })
            }


            
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            if (error.response?.status === 403) logout()
        } finally {
            setLoading(false)
        }
    }, [logout])

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    if (loading) {
        return <div className="loading">Loading dashboard...</div>
    }

    return (
        <div className="dashboard-layout admin-dashboard">
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
                           <span className="badge badge-high">Admin</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🛡️</span> {user?.role}
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
                <div className="stats-grid-3">
                    <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#6366f1'}}>
                            📦
                        </div>
                        <div className="stat-title">Total Assets</div>
                        <div className="stat-value">{stats.totalAssets >= 10 ? `${Math.floor(stats.totalAssets / 10) * 10}+` : stats.totalAssets}</div>
                    </div>
                    <div className="card-footer">
                        <Link to="/assets">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#10b981'}}>
                            ✅
                        </div>
                        <div className="stat-title">Assigned</div>
                        <div className="stat-value">{stats.assignedAssets}</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#f59e0b'}}>
                            📝
                        </div>
                        <div className="stat-title">Pending Req.</div>
                        <div className="stat-value">{stats.pendingRequests}</div>
                    </div>
                    <div className="card-footer">
                        <Link to="/requests">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#ec4899'}}>
                            👥
                        </div>
                        <div className="stat-title">Total Users</div>
                        <div className="stat-value">{stats.totalUsers >= 10 ? `${Math.floor(stats.totalUsers / 10) * 10}+` : stats.totalUsers}</div>
                    </div>
                    <div className="card-footer">
                         <Link to="/employees">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#8b5cf6'}}>
                            🏷️
                        </div>
                        <div className="stat-title">Categories</div>
                        <div className="stat-value">{stats.totalCategories || 0}</div>
                    </div>
                    <div className="card-footer">
                         <Link to="/categories">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget split-stats">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#06b6d4'}}>
                            📍
                        </div>
                        <div className="split-container">
                            <div className="split-item">
                                <div className="stat-title">Locations</div>
                                <div className="stat-value">{stats.totalLocations}</div>
                            </div>
                            <div className="split-divider"></div>
                            <div className="split-item">
                                <div className="stat-title">Rooms</div>
                                <div className="stat-value">{stats.totalRooms}</div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                         <Link to="/locations">
                            View full details →
                        </Link>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
