"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"

const MaintenanceDashboard = () => {
  const { user } = useAuth()
  const [pendingTasks, setPendingTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [assetsToMaintain, setAssetsToMaintain] = useState([])
  const [stats, setStats] = useState({ pending: 0, completed: 0, totalAssets: 0 })

  useEffect(() => {
    fetchDashboardData()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/maintenance/dashboard", {
        headers: { Authorization: `Bearer ${user?.token}` },
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
      console.error(err)
    }
  }

  return (
    <div>
      <h2>Maintenance Dashboard</h2>
      <p>Welcome {user?.name}, manage maintenance tasks and asset configurations.</p>

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

      <div className="card">
        <h3>Pending Maintenance Tasks</h3>
        <ul>
          {pendingTasks.map((task) => (
            <li key={task.id}>
              {task.maintenance_type} on {task.asset_name} - Priority: {task.priority}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Completed Tasks</h3>
        <ul>
          {completedTasks.map((task) => (
            <li key={task.id}>
              {task.maintenance_type} on {task.asset_name} - Completed on {task.completed_date}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Assets to Maintain</h3>
        <ul>
          {assetsToMaintain.map((asset) => (
            <li key={asset.id}>
              {asset.name} - Status: {asset.status} - Last Maintenance: {asset.last_maintenance}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <ul>
          <li><a href="/new-configuration">Configure New Asset</a></li>
          <li><a href="/update-maintenance">Update Maintenance Record</a></li>
          <li><a href="/maintenance-tasks">View All Tasks</a></li>
        </ul>
      </div>
    </div>
  )
}

export default MaintenanceDashboard
