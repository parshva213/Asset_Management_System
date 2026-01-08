"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"

const SupervisorDashboard = () => {
  const { logout } = useAuth()
  const [stats, setStats] = useState({
    totalAssets: 0,
    assignedAssets: 0,
    availableAssets: 0,
    pendingRequests: 0,
    departmentUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await fetch("http://localhost:5000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.status === 403) {
        logout()
        return
      }
      const data = await response.json()
      setStats({
        totalAssets: data.totalAssets || 0,
        assignedAssets: data.assignedAssets || 0,
        availableAssets: data.availableAssets || 0,
        pendingRequests: data.pendingRequests || 0,
        departmentUsers: data.departmentUsers || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div>
      <h2 style={{ marginBottom: "10px" }}>IT Supervisor Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalAssets}</div>
          <div className="stat-label">Total Assets</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.assignedAssets}</div>
          <div className="stat-label">Assigned Assets</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.availableAssets}</div>
          <div className="stat-label">Available Assets</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pendingRequests}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.departmentUsers}</div>
          <div className="stat-label">Department Employees</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>Quick Actions</h3>
        <div className="quick-actions">
          <a href="/assets" className="quick-action">Assign Assets</a>
          <a href="/locations" className="quick-action">Manage Rooms</a>
          <a href="/requests" className="quick-action">View Requests</a>
          <a href="/employees" className="quick-action">Manage Employees</a>
          <a href="/purchase-orders" className="quick-action">Purchase Orders</a>
        </div>
      </div>
    </div>
  )
}

export default SupervisorDashboard
