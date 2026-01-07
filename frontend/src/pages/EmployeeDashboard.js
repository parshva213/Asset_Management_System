"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"

const EmployeeDashboard = () => {
  const { logout } = useAuth()
  const [stats, setStats] = useState({
    totalAssets: 0,
    pendingRequests: 0,
    myRequests: 0,
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
        pendingRequests: data.pendingRequests || 0,
        myRequests: data.myRequests || 0,
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
      <h2 style={{ marginBottom: "30px" }}>Employee Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalAssets}</div>
          <div className="stat-label">Total Assets</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pendingRequests}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.myRequests}</div>
          <div className="stat-label">My Requests</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>Quick Actions</h3>
        <div className="quick-actions">
          <a href="/assets" className="quick-action">View My Assets</a>
          <a href="/requests" className="quick-action">Submit Request</a>
          <a href="/requests" className="quick-action">View My Requests</a>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
