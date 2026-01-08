"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"

const VendorDashboard = () => {
  const { user, logout } = useAuth()
  const [pendingOrders, setPendingOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [suppliedAssets, setSuppliedAssets] = useState([])
  const [stats, setStats] = useState({ pending: 0, completed: 0, totalSupplied: 0 })

  useEffect(() => {
    fetchDashboardData()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const response = await axios.get("http://localhost:5000/api/vendor/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = response.data
      setPendingOrders(data.pendingOrders || [])
      setCompletedOrders(data.completedOrders || [])
      setSuppliedAssets(data.suppliedAssets || [])
      setStats({
        pending: data.pendingCount || 0,
        completed: data.completedCount || 0,
        totalSupplied: data.totalSupplied || 0,
      })
    } catch (err) {
      if (err.response?.status === 403) {
        logout()
      } else {
        console.error(err)
      }
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: "10px" }}>Vendor Dashboard</h2>
      <p>Welcome {user?.name}, manage your supplies and orders.</p>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalSupplied}</div>
          <div className="stat-label">Assets Supplied</div>
        </div>
      </div>

      <div className="card">
        <h3>Pending Purchase Orders</h3>
        <ul>
          {pendingOrders.map((order) => (
            <li key={order.id}>
              {order.asset_name} - Qty: {order.quantity} - Requested by {order.requested_by}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Completed Orders</h3>
        <ul>
          {completedOrders.map((order) => (
            <li key={order.id}>
              {order.asset_name} - Qty: {order.quantity} - Delivered on {order.delivery_date}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Supplied Assets</h3>
        <ul>
          {suppliedAssets.map((asset) => (
            <li key={asset.id}>
              {asset.name} - Warranty: {asset.warranty_number}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <ul>
          <li><a href="/supply-assets">Supply New Assets</a></li>
          <li><a href="/warranty-docs">Update Warranty Info</a></li>
          <li><a href="/vendor-requests">View Requests</a></li>
        </ul>
      </div>
    </div>
  )
}

export default VendorDashboard
