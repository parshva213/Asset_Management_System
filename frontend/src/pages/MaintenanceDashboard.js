"use client"
import { useEffect, useState } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import { formatDate } from "../utils/dateUtils"

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
            <div className="alert alert-error" style={{marginBottom: '0'}}>
                {error}
            </div>
        )}
        {/* Row 1: Profile + Stats */}
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
                       <span className="badge badge-high">Maintenance</span>
                    </div>
                </div>
                <div className="card-body">
                    <div className="profile-detail-item">
                        <span>📧</span> {user?.email}
                    </div>
                    <div className="profile-detail-item">
                        <span>🏷️</span> {user?.role} - {user?.department || 'IT Dept'}
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
                        <div className="stat-icon-wrapper" style={{background: '#f43f5e'}}>
                            📋
                        </div>
                        <div className="stat-title">Total Workorders</div>
                        <div className="stat-value">
                            {(stats.pending + stats.completed) >= 10 ? `${Math.floor((stats.pending + stats.completed) / 10) * 10}+` : (stats.pending + stats.completed)}
                        </div>
                    </div>
                    <div className="card-footer">
                         <Link to="/maintenance-tasks">
                            View full details →
                        </Link>
                    </div>
                </div>
               
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#f59e0b'}}>
                            ⚡
                        </div>
                        <div className="stat-title">High Priority</div>
                        <div className="stat-value">
                            {pendingTasks.filter(t => t.priority === 'High').length >= 10 ? `${Math.floor(pendingTasks.filter(t => t.priority === 'High').length / 10) * 10}+` : pendingTasks.filter(t => t.priority === 'High').length}
                        </div>
                    </div>
                </div>
                
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#8b5cf6'}}>
                            ⚙️
                        </div>
                        <div className="stat-title">Config Management</div>
                        <div className="stat-value">{stats.configCount >= 10 ? `${Math.floor(stats.configCount / 10) * 10}+` : stats.configCount}</div>
                    </div>
                    <div className="card-footer">
                         <Link to="/new-configuration">
                            Manage Config →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#06b6d4'}}>
                            🔧
                        </div>
                        <div className="stat-title">Update Tasks</div>
                        <div className="stat-value">{stats.pending >= 10 ? `${Math.floor(stats.pending / 10) * 10}+` : stats.pending}</div>
                    </div>
                    <div className="card-footer">
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
