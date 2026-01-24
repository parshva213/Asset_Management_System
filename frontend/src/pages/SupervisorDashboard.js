"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"
import { formatDate } from "../utils/dateUtils"

const SupervisorDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        totalAssets: 0,
        assignedAssets: 0,
        availableAssets: 0,
        pendingRequests: 0,
        maintenanceRequests: 0,
        totalRooms: 0,
        totalOrders: 0,
        assignedAssetsList: [],
        pendingRequestsList: []
    })
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        try {
            const [dashboardRes] = await Promise.allSettled([
                api.get("/supervisor/dashboard")
            ])

            if (dashboardRes.status === 'fulfilled') {
                const data = dashboardRes.value.data
                setStats({
                    totalAssets: data.totalAssets || 0,
                    assignedAssets: data.assignedAssets || 0,
                    availableAssets: data.availableAssets || 0,
                    pendingRequests: data.pendingRequests || 0,
                    departmentUsers: data.departmentUsers || 0,
                    totalRooms: data.totalRooms || 0,
                    totalOrders: data.totalOrders || 0,
                    assignedAssetsList: data.assignedAssetsList || [],
                    pendingRequestsList: data.pendingRequestsList || []
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
        <div className="dashboard-layout supervisor-dashboard">
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
                           <span className="badge badge-high">Supervisor</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🛡️</span> {user?.role} - {user?.department || 'General'}
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
                        <Link to="/supervisor-details">
                            View full details →
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-2">
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{background: '#10b981'}}>
                                📦
                            </div>
                            <div className="stat-title">Assigned Assets</div>
                            <div className="stat-value">{stats.assignedAssets >= 10 ? `${Math.floor(stats.assignedAssets / 10) * 10}+` : stats.assignedAssets}</div>
                        </div>
                         <div className="card-footer">
                             <Link to="/assets">
                                View full details →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{background: '#f59e0b'}}>
                                📝
                            </div>
                            <div className="stat-title">Pending Req.</div>
                            <div className="stat-value">{stats.pendingRequests >= 10 ? `${Math.floor(stats.pendingRequests / 10) * 10}+` : stats.pendingRequests}</div>
                        </div>
                        <div className="card-footer">
                            <Link to="/requests">
                                View full details →
                            </Link>
                        </div>
                    </div>
                     <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{background: '#8b5cf6'}}>
                                 📍
                            </div>
                            <div className="stat-title">Manage Rooms</div>
                            <div className="stat-value">{stats.totalRooms >= 10 ? `${Math.floor(stats.totalRooms / 10) * 10}+` : stats.totalRooms}</div>
                        </div>
                        <div className="card-footer">
                             <Link to="/locations">
                                View full details →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{background: '#06b6d4'}}>
                                 🛒
                            </div>
                            <div className="stat-title">Orders</div>
                            <div className="stat-value">{stats.totalOrders >= 10 ? `${Math.floor(stats.totalOrders / 10) * 10}+` : stats.totalOrders}</div>
                        </div>
                        <div className="card-footer">
                             <Link to="/purchase-orders">
                                View full details →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SupervisorDashboard
