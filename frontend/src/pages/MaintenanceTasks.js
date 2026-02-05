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
    <div className="page-container">
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

      <div className="table-container">
        {tasks.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Maintenance Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} id={`maint-${task.id}`}>
                  <td>{task.asset_name}</td>
                  <td>{task.maintenance_type}</td>
                  <td>
                     <span className={`badge ${task.priority === 'High' ? 'badge-high' : 'badge-medium'}`}>
                        {task.priority || 'Medium'}
                     </span>
                  </td>
                  <td>
                    <span className={`badge ${task.status === 'Completed' ? 'badge-high' : 'badge-low'}`}>
                        {task.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                        {task.status !== 'In Progress' && task.status !== 'Completed' && (
                            <button onClick={() => updateTask(task.id, "In Progress")} className="btn btn-secondary btn-sm">Start</button>
                        )}
                        {task.status !== 'Completed' && (
                             <button onClick={() => updateTask(task.id, "Completed")} className="btn btn-primary btn-sm">Complete</button>
                        )}
                        {task.status === 'Completed' && (
                            <span className="text-muted">-</span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No active tasks found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MaintenanceTasks
