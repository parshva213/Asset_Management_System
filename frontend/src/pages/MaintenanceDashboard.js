"use client"
import { useEffect, useState } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

const MaintenanceDashboard = () => {
    const { user } = useAuth()
    const [pendingTasks, setPendingTasks] = useState([])
    const [stats, setStats] = useState({ pending: 0, completed: 0, totalAssets: 0, configCount: 0 })
    const [error, setError] = useState(null)

    // Dashboard State
    useEffect(() => {
        fetchDashboardData()
    }, [user])

    const fetchDashboardData = async () => {
        try {
            setError(null)
            const res = await api.get("/maintenance/dashboard")
            const data = res.data
            setPendingTasks(data.pendingTasks || [])
            setStats({
                pending: data.pendingCount || 0,
                completed: data.completedCount || 0,
                totalAssets: data.totalAssets || 0,
                configCount: data.configCount || 0,
            })
        } catch (err) {
            console.error(err)
            setError("Failed to load dashboard data.")
        }
    }

    return (
        <div className="dashboard-layout maintenance-dashboard">

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '0' }}>
                    {error}
                </div>
            )}
            {/* Row 1: Profile + Stats */}
            <div className="dashboard-top-row">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="avatar-circle">
                            {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "M"}
                        </div>
                        <div className="profile-greeting">
                            <h3>Hi, {user?.name || "Maintenance"}</h3>
                            <span className="waving-hand">👋</span>
                            <span className="role-badge">Maintenance</span>
                        </div>
                    </div>
                    <div className="profile-details">
                        <div className="info-row">
                            <span className="info-icon">📧</span> {user?.email}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">📞</span> {user?.phone || "Not set"}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">🛡️</span> {user?.role} - {user?.department || "IT Dept"}
                        </div>

                        <div className="info-row">
                            <span className="info-icon">🏢</span> {user?.location_name || "Not assigned"}
                        </div>
                    </div>
                    <div className="profile-footer">
                        <Link to="/profile">Update Profile →</Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-2">
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon rose">
                                📋
                            </div>
                            <span className="stat-label">Total Workorders</span>
                            <h3 className="stat-value">
                                {(stats.pending + stats.completed) >= 10 ? `${Math.floor((stats.pending + stats.completed) / 10) * 10}+` : (stats.pending + stats.completed)}
                            </h3>
                        </div>
                        <div className="stat-footer">
                            <Link to="/maintenance-tasks">
                                View full details →
                            </Link>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon orange">
                                ⚡
                            </div>
                            <span className="stat-label">High Priority</span>
                            <h3 className="stat-value">
                                {pendingTasks.filter(t => t.priority === 'High').length >= 10 ? `${Math.floor(pendingTasks.filter(t => t.priority === 'High').length / 10) * 10}+` : pendingTasks.filter(t => t.priority === 'High').length}
                            </h3>
                        </div>
                        <div className="stat-footer">
                            <span>Action needed</span>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon purple">
                                ⚙️
                            </div>
                            <span className="stat-label">Config Management</span>
                            <h3 className="stat-value">{stats.configCount >= 10 ? `${Math.floor(stats.configCount / 10) * 10}+` : stats.configCount}</h3>
                        </div>
                        <div className="stat-footer">
                            <Link to="/new-configuration">
                                Manage Config →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon teal">
                                🔧
                            </div>
                            <span className="stat-label">Update Tasks</span>
                            <h3 className="stat-value">{stats.pending >= 10 ? `${Math.floor(stats.pending / 10) * 10}+` : stats.pending}</h3>
                        </div>
                        <div className="stat-footer">
                            <Link to="/update-maintenance">
                                Update Now →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default MaintenanceDashboard
