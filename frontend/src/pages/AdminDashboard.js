"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        assignedAssets: 0,
        maintainedAssets: 0,
        availableAssets: 0,
        pendingRequests: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        hwCategories: 0,
        swCategories: 0,
        totalLocations: 0,
        totalRooms: 0,
        pendingOrders: 0,
        completedOrders: 0,
        approvedRequests: 0,
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
                    assignedAssets: data.assignedAssets,
                    maintainedAssets: data.maintainedAssets,
                    availableAssets: data.availableAssets,
                    pendingRequests: data.pendingRequests,
                    activeUsers: data.activeUsers || 0,
                    inactiveUsers: data.inactiveUsers || 0,
                    hwCategories: data.hwCategories || 0,
                    swCategories: data.swCategories || 0,
                    totalLocations: data.totalLocations || 0,
                    totalRooms: data.totalRooms || 0,
                    pendingOrders: data.pendingOrders || 0,
                    completedOrders: data.completedOrders || 0,
                    approvedRequests: data.approvedRequests || 0,
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
                    {/* Assets Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-indigo">📦</div>
                            <span className="widget-title">Assets</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
<<<<<<< HEAD
                                <span className="stat-label">Total</span>
                                <h3 className="stat-value">{stats.totalAssets}</h3>
=======
                                <span className="stat-label">Available</span>
                                <h3 className="stat-value">{stats.availableAssets}</h3>
>>>>>>> 5618f10ec87921f047d9f5792783016fdacb7b35
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Assigned</span>
                                <h3 className="stat-value">{stats.assignedAssets}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Maintained</span>
                                <h3 className="stat-value">{stats.maintainedAssets}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            <Link to="/assets">View Maintained Assets →</Link>
                        </div>
                    </div>

                    {/* Orders Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-green">🛒</div>
                            <span className="widget-title">Orders</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Pending</span>
                                <h3 className="stat-value">{stats.pendingOrders}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Completed</span>
                                <h3 className="stat-value">{stats.completedOrders}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            <Link to="/purchase-orders">View Orders →</Link>
                        </div>
                    </div>

                    {/* Requests Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-amber">📝</div>
                            <span className="widget-title">Requests</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Pending</span>
                                <h3 className="stat-value">{stats.pendingRequests}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Approved</span>
                                <h3 className="stat-value">{stats.approvedRequests}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            <Link to="/requests">View Requests →</Link>
                        </div>
                    </div>

                    {/* Users Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-rose">👥</div>
                            <span className="widget-title">Users</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Active</span>
                                <h3 className="stat-value">{stats.activeUsers || 0}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Inactive</span>
                                <h3 className="stat-value">{stats.inactiveUsers || 0}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                             <Link to="/employees">View Maintenance Team →</Link>
                        </div>
                    </div>

                    {/* Categories Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-purple">🏷️</div>
                            <span className="widget-title">Categories</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Hardware</span>
                                <h3 className="stat-value">{stats.hwCategories || 0}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Software</span>
                                <h3 className="stat-value">{stats.swCategories || 0}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                             <Link to="/categories">View Categories →</Link>
                        </div>
                    </div>

                    {/* Locations Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-cyan">📍</div>
                            <span className="widget-title">Locations</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Locations</span>
                                <h3 className="stat-value">{stats.totalLocations}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Rooms</span>
                                <h3 className="stat-value">{stats.totalRooms}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                             <Link to="/locations">View Locations →</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default AdminDashboard
