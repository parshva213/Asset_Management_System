"use client"
import { useEffect, useState } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

const MaintenanceDashboard = () => {
  const { user } = useAuth()
  const [pendingTasks, setPendingTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [assetsToMaintain, setAssetsToMaintain] = useState([])
  const [stats, setStats] = useState({ pending: 0, completed: 0, totalAssets: 0 })
  const [error, setError] = useState(null)
  
  // Dashboard Tabs State
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
        setError(null)
      const res = await api.get("/maintenance/dashboard")
      const data = res.data
      setPendingTasks(data.pendingTasks || [])
      setCompletedTasks(data.completedTasks || [])
      setAssetsToMaintain(data.assetsToMaintain || [])
      setStats({
        pending: data.pendingCount || 0,
        completed: data.completedCount || 0,
        totalAssets: data.totalAssets || 0,
      })
    } catch (err) {
      console.error(err)
      setError("Failed to load dashboard data.")
    }
  }

  return (
    <div className="dashboard-layout">
        {error && (
            <div className="alert alert-error" style={{marginBottom: '0'}}>
                {error}
            </div>
        )}
        {/* Row 1: Profile + Stats */}
        <div className="dashboard-top-row">
            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-header">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} 
                        alt="Profile" 
                        className="profile-avatar" 
                    />
                    <div className="profile-info">
                        <h3>Hi, {user?.name} 👋</h3>
                        <span style={{color: 'var(--success)', fontSize: '0.8rem', fontWeight: '500'}}>Online</span>
                    </div>
                </div>
                <div className="profile-details">
                    <div className="profile-detail-item">
                        <span>📧</span> {user?.email}
                    </div>
                    <div className="profile-detail-item">
                        <span>🏷️</span> {user?.role} - {user?.department || 'IT Dept'}
                    </div>
                    <Link to="/profile" style={{marginTop: '1rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none'}}>
                        View full details →
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-4">
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#f43f5e'}}>
                            📋
                        </div>
                        <div className="stat-title">Total Workorders</div>
                        <div className="stat-value">{stats.pending + stats.completed}</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#10b981'}}>
                            cx
                        </div>
                        <div className="stat-title">Pending Workorders</div>
                        <div className="stat-value">{stats.pending}</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#f59e0b'}}>
                            ⚡
                        </div>
                        <div className="stat-title">High Priority</div>
                        <div className="stat-value">{pendingTasks.filter(t => t.priority === 'High').length}</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{background: '#6366f1'}}>
                            ⚠️
                        </div>
                        <div className="stat-title">Assets Under Maint.</div>
                        <div className="stat-value">{stats.totalAssets}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Row 2: Work Orders Table */}
        <div className="table-container">
            <div className="table-header-row">
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending WO
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Work orders
                    </button>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <input type="text" placeholder="Search" className="form-input" style={{padding: '0.4rem 1rem', width: '200px'}} />
                </div>
            </div>
            
            <table className="table" style={{background: 'transparent', boxShadow: 'none', border: 'none'}}>
                <thead>
                    <tr>
                        <th style={{background: 'transparent', color: 'var(--text-secondary)'}}>Service ID</th>
                        <th style={{background: 'transparent', color: 'var(--text-secondary)'}}>Asset Name</th>
                        <th style={{background: 'transparent', color: 'var(--text-secondary)'}}>Type</th>
                        <th style={{background: 'transparent', color: 'var(--text-secondary)'}}>Priority</th>
                        <th style={{background: 'transparent', color: 'var(--text-secondary)'}}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {(activeTab === 'pending' ? pendingTasks : [...pendingTasks, ...completedTasks]).map((task, idx) => (
                        <tr key={task.id}>
                            <td>Service ID - {task.id}</td>
                            <td>{task.asset_name}</td>
                            <td>{task.maintenance_type}</td>
                            <td>
                                <span className={`badge ${task.priority === 'High' ? 'badge-high' : 'badge-medium'}`}>
                                    {task.priority || 'Medium'}
                                </span>
                            </td>
                            <td>{task.status}</td>
                        </tr>
                    ))}
                    {pendingTasks.length === 0 && activeTab === 'pending' && (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No pending work orders</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Row 3: Recent Sections */}
        <div className="dashboard-top-row">
            <div className="card">
                <h3>Recent Assigned Tasks</h3>
                <ul className="list-group">
                    {assetsToMaintain.slice(0, 3).map(asset => (
                        <li key={asset.id} className="list-group-item">
                            <div>
                                <strong>{asset.name}</strong>
                                <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Status: {asset.status}</div>
                            </div>
                            <span className="badge badge-low">Update</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="card">
                 <h3>Recent Checklists</h3>
                 <div style={{color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center'}}>
                    No checklists pending
                 </div>
            </div>
        </div>
    </div>
  )
}

export default MaintenanceDashboard
