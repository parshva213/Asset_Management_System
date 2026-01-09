"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

const MaintenanceDashboard = () => {
  const { user } = useAuth()
  const [pendingTasks, setPendingTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [assetsToMaintain, setAssetsToMaintain] = useState([])
  const [stats, setStats] = useState({ pending: 0, completed: 0, totalAssets: 0 })

  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
        setError(null)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await axios.get("http://localhost:5000/api/maintenance/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = response.data
      setPendingTasks(data.pendingTasks || [])
      setCompletedTasks(data.completedTasks || [])
      setAssetsToMaintain(data.assetsToMaintain || [])
      setStats({
        pending: data.pendingCount || 0,
        completed: data.completedCount || 0,
        totalAssets: data.totalAssets || 0,
      })
    } catch (err) {
      if (err.response?.status === 403) {
        // logout() // Prevent auto-logout to debug/UX
        setError("Access Denied: You do not have permission to view the Maintenance Dashboard. (Please ensure backend is restarted if you recently updated permissions)")
      } else {
        console.error(err)
        setError("Failed to load dashboard data.")
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Maintenance Dashboard</h2>
        <p>Welcome {user?.name}, manage maintenance tasks and asset configurations.</p>
      </div>
      
      {error && (
        <div className="alert alert-error">
            {error}
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalAssets}</div>
          <div className="stat-label">Assets Under Maintenance</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Pending Maintenance Tasks</h3>
          <ul className="list-group">
            {pendingTasks.length > 0 ? pendingTasks.map((task) => (
              <li key={task.id} className="list-group-item">
                <span><strong>{task.maintenance_type}</strong> on {task.asset_name}</span>
                <span className="badge badge-warning">Priority: {task.priority}</span>
              </li>
            )) : <li className="list-group-item">No pending tasks</li>}
          </ul>
        </div>

        <div className="card">
          <h3>Completed Tasks</h3>
          <ul className="list-group">
            {completedTasks.length > 0 ? completedTasks.map((task) => (
              <li key={task.id} className="list-group-item">
                <span><strong>{task.maintenance_type}</strong> on {task.asset_name}</span>
                <span style={{ fontSize: '0.8rem' }}>{new Date(task.completed_date).toLocaleDateString()}</span>
              </li>
            )) : <li className="list-group-item">No completed tasks recently</li>}
          </ul>
        </div>

        <div className="card">
          <h3>Assets to Maintain</h3>
          <ul className="list-group">
            {assetsToMaintain.length > 0 ? assetsToMaintain.map((asset) => (
              <li key={asset.id} className="list-group-item">
                <span><strong>{asset.name}</strong></span>
                <span>{asset.status}</span>
              </li>
            )) : <li className="list-group-item">All assets are in good condition</li>}
          </ul>
        </div>

        <div className="card full-width-col">
          <h3>Quick Actions</h3>
          <div className="action-grid">
             <Link to="/new-configuration" className="action-card-btn">
                <span>Configure New Asset</span>
                <span className="action-arrow">→</span>
             </Link>
             <Link to="/update-maintenance" className="action-card-btn">
                <span>Update Maintenance Record</span>
                <span className="action-arrow">→</span>
             </Link>
             <Link to="/maintenance-tasks" className="action-card-btn">
                <span>View All Tasks</span>
                <span className="action-arrow">→</span>
             </Link>
             {/* Adding dummy actions to fill the row like the image if desired, or just these 3 */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceDashboard
