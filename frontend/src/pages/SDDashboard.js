"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"
import { formatDate } from "../utils/dateUtils"

const SDDashboard = () => {
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
            const dashboardRes = await api.get("/sd/dashboard")
            setStats({
                assignedAssets: dashboardRes.data.assignedAssets || 0,
                pendingRequests: dashboardRes.data.pendingRequests || 0,
                approvedRequests: dashboardRes.data.approvedRequests || 0,
                totalRequests: dashboardRes.data.totalRequests || 0,
                assignedAssetsList: dashboardRes.data.assignedAssetsList || [],
                myRequests: dashboardRes.data.myRequests || []
            })
        } catch (error) {
            console.error("Error fetching SD dashboard data:", error)
            if (error.response?.status === 403) logout()
        } finally {
            setLoading(false)
        }
    }, [logout])

    useEffect(() => {
        if(user) fetchDashboardData()
    }, [fetchDashboardData, user])

    if (loading) {
        return <div className="loading">Loading Software Developer dashboard...</div>
    }

    return (
        <div className="dashboard-layout employee-dashboard sd-dashboard">
            <div className="dashboard-top-row">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff`}
                            alt="Profile"
                            className="profile-avatar"
                        />
                        <div className="profile-info">
                            <h3>Hi, {user?.name} 👋</h3>
                           <span className="badge badge-high">Software Developer</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🏢</span> {user?.department || 'Engineering'}
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
                            View full profile →
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-2">
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                                💻
                            </div>
                            <div className="stat-title">My Workstation</div>
                            <div className="stat-value">{stats.assignedAssets}</div>
                        </div>
                         <div className="card-footer">
                            <Link to="/assets">
                                View Assets →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#f59e0b' }}>
                                ⏳
                            </div>
                            <div className="stat-title">Pending Tickets</div>
                            <div className="stat-value">{stats.pendingRequests}</div>
                        </div>
                        <div className="card-footer">
                            <Link to="/requests">
                                Track Requests →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#3b82f6' }}>
                                ✅
                            </div>
                            <div className="stat-title">Approved</div>
                            <div className="stat-value">{stats.approvedRequests}</div>
                        </div>
                         <div className="card-footer">
                            <Link to="/requests">
                                View History →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#8b5cf6' }}>
                                 ✨
                            </div>
                            <div className="stat-title">New Request</div>
                            <div className="stat-value">{stats.totalRequests}</div>
                        </div>
                        <div className="card-footer">
                             <Link to="/requests">
                                Request Asset →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default SDDashboard
