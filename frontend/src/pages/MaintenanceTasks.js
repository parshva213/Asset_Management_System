"use client"
import { useState, useEffect } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"

const MaintenanceTasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/maintenance/tasks")
        setTasks(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchTasks()
  }, [user])

  const updateTask = async (id, status) => {
    try {
      await api.put(`/maintenance/tasks/${id}`, { status })
      setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h2>Maintenance Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.maintenance_type} - {task.status}
            <button onClick={() => updateTask(task.id, "In Progress")}>Start</button>
            <button onClick={() => updateTask(task.id, "Completed")}>Complete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MaintenanceTasks
