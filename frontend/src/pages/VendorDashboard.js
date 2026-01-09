"use client"
import { useEffect, useState, useCallback } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

const VendorDashboard = () => {
  const { user, logout } = useAuth()
  const [pendingOrders, setPendingOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [suppliedAssets, setSuppliedAssets] = useState([])
  const [stats, setStats] = useState({ pending: 0, completed: 0, totalSupplied: 0 })

  /* Tabs State */
  const [activeTab, setActiveTab] = useState('pending')

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get("/vendor/dashboard")
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
  }, [logout])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="dashboard-layout">
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
                        <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '500' }}>Vendor</span>
                    </div>
                </div>
                <div className="profile-details">
                    <div className="profile-detail-item">
                        <span>📧</span> {user?.email}
                    </div>
                    <div className="profile-detail-item">
                        <span>🏢</span> {user?.department || 'External Vendor'}
                    </div>
                     <Link to="/profile" style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                        View full details →
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-4">
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{ background: '#f59e0b' }}>
                            📦
                        </div>
                        <div className="stat-title">Pending Orders</div>
                        <div className="stat-value">{stats.pending}</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                            ✅
                        </div>
                        <div className="stat-title">Completed</div>
                        <div className="stat-value">{stats.completed}</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div>
                        <div className="stat-icon-wrapper" style={{ background: '#6366f1' }}>
                            🚚
                        </div>
                        <div className="stat-title">Total Supplied</div>
                        <div className="stat-value">{stats.totalSupplied}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tables Section */}
        <div className="table-container">
            <div className="table-header-row">
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Orders
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed History
                    </button>
                    <button 
                         className={`tab-btn ${activeTab === 'supplied' ? 'active' : ''}`}
                         onClick={() => setActiveTab('supplied')}
                    >
                        Supplied Assets
                    </button>
                </div>
            </div>
            
            <div style={{overflowX: 'auto'}}>
                <table className="table">
                    <thead>
                        <tr>
                            {activeTab === 'supplied' ? (
                                <>
                                    <th>Asset Name</th>
                                    <th>Warranty Number</th>
                                    <th>Category</th>
                                </>
                            ) : (
                                <>
                                    <th>Order ID</th>
                                    <th>Asset Name</th>
                                    <th>Quantity</th>
                                    <th>{activeTab === 'pending' ? 'Requested By' : 'Delivered Date'}</th>
                                    <th>Status</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === 'pending' && pendingOrders.length === 0 && (
                             <tr><td colSpan="5" className="text-center">No pending orders found.</td></tr>
                        )}
                        {activeTab === 'pending' && pendingOrders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.asset_name}</td>
                                <td>{order.quantity}</td>
                                <td>{order.requested_by}</td>
                                <td><span className="badge badge-medium">Pending</span></td>
                            </tr>
                        ))}

                        {activeTab === 'completed' && completedOrders.length === 0 && (
                             <tr><td colSpan="5" className="text-center">No completed orders found.</td></tr>
                        )}
                        {activeTab === 'completed' && completedOrders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.asset_name}</td>
                                <td>{order.quantity}</td>
                                <td>{order.delivery_date || 'N/A'}</td>
                                <td><span className="badge badge-high">Completed</span></td>
                            </tr>
                        ))}

                        {activeTab === 'supplied' && suppliedAssets.length === 0 && (
                             <tr><td colSpan="3" className="text-center">No supplied assets found.</td></tr>
                        )}
                        {activeTab === 'supplied' && suppliedAssets.map((asset) => (
                            <tr key={asset.id}>
                                <td>{asset.name}</td>
                                <td>{asset.warranty_number || 'N/A'}</td>
                                <td>{asset.category || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-top-row">
            <div className="card full-width-col" style={{ gridColumn: '1 / -1' }}>
                <h3>Quick Actions</h3>
                <div className="action-grid">
                    <Link to="/supply-assets" className="action-card-btn">
                        <span>Supply New Assets</span>
                        <span className="action-arrow">→</span>
                    </Link>
                    <Link to="/warranty-docs" className="action-card-btn">
                        <span>Warranty Info</span>
                        <span className="action-arrow">→</span>
                    </Link>
                     <Link to="/vendor-requests" className="action-card-btn">
                        <span>View Requests</span>
                        <span className="action-arrow">→</span>
                    </Link>
                </div>
            </div>
        </div>
    </div>
  )
}

export default VendorDashboard
