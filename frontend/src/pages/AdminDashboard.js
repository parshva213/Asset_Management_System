"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAssets: 0,
    assignedAssets: 0,
    availableAssets: 0,
    pendingRequests: 0,
    totalUsers: 0,
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
      const data = await response.json()
      setStats({
        totalAssets: data.totalAssets || 0,
        assignedAssets: data.assignedAssets || 0,
        availableAssets: data.availableAssets || 0,
        pendingRequests: data.pendingRequests || 0,
        totalUsers: data.totalUsers || 0,
        departmentUsers: data.departmentUsers || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div>
      <h2 style={{ marginBottom: "30px" }}>Admin Dashboard</h2>

      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))' }}>
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
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.departmentUsers}</div>
          <div className="stat-label">Department Users</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>Quick Actions</h3>
        <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', justifyContent: 'space-around' }}>
          <a href="/employees" className="btn btn-secondary quick-action-btn" style={{ justifyContent: 'space-between', padding: '1.5rem', height: 'auto' }}>
              <span>Manage Users</span>
              <span>→</span>
          </a>
          <a href="/assets" className="btn btn-secondary quick-action-btn" style={{ justifyContent: 'space-between', padding: '1.5rem', height: 'auto' }}>
              <span>Manage Assets</span>
              <span>→</span>
          </a>
          <a href="/categories" className="btn btn-secondary quick-action-btn" style={{ justifyContent: 'space-between', padding: '1.5rem', height: 'auto' }}>
              <span>Manage Categories</span>
              <span>→</span>
          </a>
          <a href="/locations" className="btn btn-secondary quick-action-btn" style={{ justifyContent: 'space-between', padding: '1.5rem', height: 'auto' }}>
              <span>Manage Locations</span>
              <span>→</span>
          </a>
          <a href="/requests" className="btn btn-secondary quick-action-btn" style={{ justifyContent: 'space-between', padding: '1.5rem', height: 'auto' }}>
              <span>View All Requests</span>
              <span>→</span>
          </a>
        </div>
      </div>
      {/* Footer is already in Layout's main-content, so redundant here if Layout wraps it. 
          Checking task: "Add Footer only in main-content to not overwrite in aside" 
          Layout structure: Sidebar | Main Content (Header + Outlet + Footer)
          Since AdminDashboard is rendered in Outlet, putting Footer here would duplicate it if Layout has it. 
          Layout.js DOES have <Footer />. 
          Task says "Add Footer only in main-content". Done via Layout.js. 
          I will NOT add it here to avoid duplication.
      */}
    </div>
  )
}

export default AdminDashboard
