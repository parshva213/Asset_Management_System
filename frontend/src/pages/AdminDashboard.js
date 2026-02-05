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
                    <div className="profile-header">
                        <div className="avatar-circle">
                            {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "AD"}
                        </div>
                        <div className="profile-greeting">
                            <h3>Hi, {user?.name}</h3>
                            <span className="waving-hand">👋</span>
                            <span className="role-badge">Admin</span>
                        </div>
                    </div>
                    <div className="profile-details">
                        <div className="info-row">
                            <span className="info-icon">📧</span> {user?.email}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">🛡️</span> {user?.role}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">🔑</span> {user?.ownpk}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">📞</span> {user?.phone || 'Not set'}
                        </div>
                    </div>
                    <div className="profile-footer">
                        <Link to="/profile">
                            View full details →
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-3">
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#6366f1'}}>
                                📦
                            </div>
                            <span className="stat-label">Total Assets</span>
                            <h3 className="stat-value">{stats.totalAssets >= 10 ? `${Math.floor(stats.totalAssets / 10) * 10}+` : stats.totalAssets}</h3>
                        </div>
                        <div className="stat-footer">
                            <Link to="/assets">
                                View full details →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#10b981'}}>
                                ✅
                            </div>
                            <span className="stat-label">Assigned</span>
                            <h3 className="stat-value">{stats.assignedAssets}</h3>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#f59e0b'}}>
                                📝
                            </div>
                            <span className="stat-label">Pending Req.</span>
                            <h3 className="stat-value">{stats.pendingRequests}</h3>
                        </div>
                        <div className="stat-footer">
                            <Link to="/requests">
                                View full details →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#ec4899'}}>
                                👥
                            </div>
                            <span className="stat-label">Total Users</span>
                            <h3 className="stat-value">{stats.totalUsers >= 10 ? `${Math.floor(stats.totalUsers / 10) * 10}+` : stats.totalUsers}</h3>
                        </div>
                        <div className="stat-footer">
                             <Link to="/employees">
                                View full details →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#8b5cf6'}}>
                                🏷️
                            </div>
                            <span className="stat-label">Categories</span>
                            <h3 className="stat-value">{stats.totalCategories || 0}</h3>
                        </div>
                        <div className="stat-footer">
                             <Link to="/categories">
                                View full details →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget split-stats">
                        <div>
                            <div className="stat-icon" style={{background: '#06b6d4'}}>
                                📍
                            </div>
                            <div className="split-container">
                                <div className="split-item">
                                    <span className="stat-label">Locations</span>
                                    <h3 className="stat-value" style={{fontSize: '1.5rem'}}>{stats.totalLocations}</h3>
                                </div>
                                <div className="split-divider"></div>
                                <div className="split-item">
                                    <span className="stat-label">Rooms</span>
                                    <h3 className="stat-value" style={{fontSize: '1.5rem'}}>{stats.totalRooms}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="stat-footer">
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
