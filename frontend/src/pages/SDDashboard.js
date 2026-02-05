"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
// import api from "../api"
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
            // const dashboardRes = await api.get("/sd/dashboard")
            const dashboardRes = ""
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
                    <div className="profile-header">
                        <div className="avatar-circle">
                             {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "SD"}
                        </div>
                        <div className="profile-greeting">
                            <h3>Hi, {user?.name}</h3>
                            <span className="waving-hand">👋</span>
                            <span className="role-badge">Software Developer</span>
                        </div>
                    </div>
                    <div className="profile-details">
                        <div className="info-row">
                            <span className="info-icon">📧</span> {user?.email}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">🏢</span> {user?.department || 'Engineering'}
                        </div>
                         <div className="info-row">
                            <span className="info-icon">📞</span> {user?.phone || 'Not set'}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">📅</span> Joined {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                        </div>
                    </div>
                     <div className="profile-footer">
                         <Link to="/profile">
                            View full profile →
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-2">
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#10b981'}}>
                                💻
                            </div>
                            <span className="stat-label">My Workstation</span>
                            <h3 className="stat-value">{stats.assignedAssets}</h3>
                        </div>
                         <div className="stat-footer">
                            <Link to="/assets">
                                View Assets →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#f59e0b'}}>
                                ⏳
                            </div>
                            <span className="stat-label">Pending Tickets</span>
                            <h3 className="stat-value">{stats.pendingRequests}</h3>
                        </div>
                        <div className="stat-footer">
                            <Link to="/requests">
                                Track Requests →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#3b82f6'}}>
                                ✅
                            </div>
                            <span className="stat-label">Approved</span>
                            <h3 className="stat-value">{stats.approvedRequests}</h3>
                        </div>
                         <div className="stat-footer">
                            <Link to="/requests">
                                View History →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon" style={{background: '#8b5cf6'}}>
                                 ✨
                            </div>
                            <span className="stat-label">New Request</span>
                            <h3 className="stat-value">{stats.totalRequests}</h3>
                        </div>
                        <div className="stat-footer">
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
