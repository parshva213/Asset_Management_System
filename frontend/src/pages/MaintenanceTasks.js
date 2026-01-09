"use client"
import { useState, useEffect } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"

const MaintenanceTasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({ pending: 0, completed: 0, totalAssets: 0 })

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [user])

  const fetchTasks = async () => {
    try {
      const res = await api.get("/maintenance/tasks")
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStats = async () => {
      try {
        const res = await api.get("/maintenance/dashboard")
        const data = res.data
        setStats({
            pending: data.pendingCount || 0,
            completed: data.completedCount || 0,
            totalAssets: data.totalAssets || 0,
        })
      } catch (err) {
          console.error(err)
      }
  }

  const updateTask = async (id, status) => {
    try {
      await api.put(`/maintenance/${id}`, { status }) // Fixed endpoint to match put route
      setTasks(tasks.filter((task) => task.id !== id)) // Remove from list if completed? Or update.
      fetchStats() // Refresh stats
      fetchTasks() // Refresh tasks
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
        <div className="page-header">
            <h2>Maintenance Tasks</h2>
            <p>Manage and track all ongoing maintenance activities.</p>
        </div>

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

      <div className="card full-width-col">
        <h3>Active Tasks</h3>
        <ul className="list-group">
          {tasks.length > 0 ? tasks.map((task) => (
            <li key={task.id} className="list-group-item">
              <div>
                <strong>{task.maintenance_type}</strong> on {task.asset_name}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: {task.status} | Priority: {task.priority}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {task.status !== 'In Progress' && (
                    <button onClick={() => updateTask(task.id, "In Progress")} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Start</button>
                )}
                <button onClick={() => updateTask(task.id, "Completed")} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Complete</button>
              </div>
            </li>
          )) : <li className="list-group-item">No active tasks found</li>}
        </ul>
      </div>
    </div>
  )
}

export default MaintenanceTasks
