"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"

const EmployeeDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        assignedAssets: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        totalRequests: 0,
        assignedAssetsList: [],
        myRequests: []
    })
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        try {
            const dashboardRes = await api.get("/employee/dashboard")
            setStats({
                assignedAssets: dashboardRes.data.assignedAssets || 0,
                pendingRequests: dashboardRes.data.pendingRequests || 0,
                approvedRequests: dashboardRes.data.approvedRequests || 0,
                totalRequests: dashboardRes.data.totalRequests || 0,
                assignedAssetsList: dashboardRes.data.assignedAssetsList || [],
                myRequests: dashboardRes.data.myRequests || []
            })
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            if (error.response?.status === 403) logout()
        } finally {
            setLoading(false)
        }
    }, [logout])

    useEffect(() => {
        if(user) fetchDashboardData()
    }, [fetchDashboardData, user])

    if (loading) {
        return <div className="loading">Loading dashboard...</div>
    }

    return (
        <div className="dashboard-layout employee-dashboard">
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
                           <span className="badge badge-high">Employee</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🏢</span> {user?.department || 'General Staff'}
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
                            <div className="stat-icon-wrapper" style={{ background: '#6366f1' }}>
                                💻
                            </div>
                            <div className="stat-title">My Assets</div>
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
                            <div className="stat-icon-wrapper" style={{ background: '#f59e0b' }}>
                                ⏳
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
                            <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                                ✅
                            </div>
                            <div className="stat-title">Approved</div>
                            <div className="stat-value">{stats.approvedRequests >= 10 ? `${Math.floor(stats.approvedRequests / 10) * 10}+` : stats.approvedRequests}</div>
                        </div>
                         <div className="card-footer">
                            <Link to="/requests">
                                View full details →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#8b5cf6' }}>
                                 ✨
                            </div>
                            <div className="stat-title">New Request</div>
                            <div className="stat-value">{stats.totalRequests >= 10 ? `${Math.floor(stats.totalRequests / 10) * 10}+` : stats.totalRequests}</div>
                        </div>
                        <div className="card-footer">
                             <Link to="/requests">
                                Create New →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-bottom-row">
                <div className="stat-widget">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>💻</span> My Assigned Assets
                    </h3>
                    {stats.assignedAssetsList.length === 0 ? (
                        <p style={{ opacity: 0.6 }}>No assets assigned</p>
                    ) : (
                        <div className="recent-list">
                            {stats.assignedAssetsList.map(asset => (
                                <div key={asset.id} className="recent-item">
                                    <div className="recent-item-info">
                                        <div className="recent-item-title">{asset.name}</div>
                                        <div className="recent-item-sub">{asset.status}</div>
                                    </div>
                                    <span className={`badge badge-${asset.status === 'Assigned' ? 'success' : 'warning'}`}>
                                        {asset.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="stat-widget">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📝</span> My Recent Requests
                    </h3>
                    {stats.myRequests.length === 0 ? (
                        <p style={{ opacity: 0.6 }}>No recent requests</p>
                    ) : (
                        <div className="recent-list">
                            {stats.myRequests.map(req => (
                                <div key={req.id} className="recent-item">
                                    <div className="recent-item-info">
                                        <div className="recent-item-title">{req.description}</div>
                                        <div className="recent-item-sub">{req.status}</div>
                                    </div>
                                    <span className={`badge badge-${req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'}`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmployeeDashboard
