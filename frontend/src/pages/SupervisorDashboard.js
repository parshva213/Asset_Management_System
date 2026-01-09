"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"

const SupervisorDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        totalAssets: 0,
        assignedAssets: 0,
        availableAssets: 0,
        pendingRequests: 0,
        departmentUsers: 0,
    })
    const [assignedAssets, setAssignedAssets] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [activeTab, setActiveTab] = useState('assets')
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        try {
            const [dashboardRes, assetsRes, requestsRes] = await Promise.allSettled([
                api.get("/dashboard"),
                api.get("/assets"), // Endpoint typically filters by scope or returns all
                api.get("/requests")
            ])

            if (dashboardRes.status === 'fulfilled') {
                const data = dashboardRes.value.data
                setStats({
                    totalAssets: data.totalAssets || 0,
                    assignedAssets: data.assignedAssets || 0,
                    availableAssets: data.availableAssets || 0,
                    pendingRequests: data.pendingRequests || 0,
                    departmentUsers: data.departmentUsers || 0,
                })
            }

            if (assetsRes.status === 'fulfilled' && Array.isArray(assetsRes.value.data)) {
                // Filter for assigned assets if necessary, or just take slice
                setAssignedAssets(assetsRes.value.data.filter(a => a.status === 'Assigned').slice(0, 5))
            }

            if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value.data)) {
                 setPendingRequests(requestsRes.value.data.filter(r => r.status === 'Pending').slice(0, 5))
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            if (error.response?.status === 403) logout()
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
                            <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '500' }}>Supervisor</span>
                        </div>
                    </div>
                    <div className="profile-details">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🏷️</span> {user?.department || 'Department'}
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
                            <div className="stat-icon-wrapper" style={{ background: '#6366f1' }}>
                                📦
                            </div>
                            <div className="stat-title">Total Assets</div>
                            <div className="stat-value">{stats.totalAssets}</div>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                                ✅
                            </div>
                            <div className="stat-title">Assigned</div>
                            <div className="stat-value">{stats.assignedAssets}</div>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#f59e0b' }}>
                                📑
                            </div>
                            <div className="stat-title">Requests</div>
                            <div className="stat-value">{stats.pendingRequests}</div>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#f43f5e' }}>
                                👥
                            </div>
                            <div className="stat-title">Employees</div>
                            <div className="stat-value">{stats.departmentUsers}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="table-container">
                <div className="table-header-row">
                    <div className="tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
                            onClick={() => setActiveTab('assets')}
                        >
                            Assigned Assets
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            Pending Requests
                        </button>
                    </div>
                </div>
                
                <div style={{overflowX: 'auto'}}>
                    <table className="table">
                        <thead>
                            <tr>
                                {activeTab === 'assets' ? (
                                    <>
                                        <th>Asset Name</th>
                                        <th>Model</th>
                                        <th>Serial #</th>
                                        <th>Assigned To</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Asset</th>
                                        <th>Requested By</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'assets' && assignedAssets.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.name}</td>
                                    <td>{a.model}</td>
                                    <td>{a.serial_number}</td>
                                    <td>{a.assigned_to || 'N/A'}</td>
                                </tr>
                            ))}
                            {activeTab === 'requests' && pendingRequests.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.asset_name}</td>
                                    <td>{r.user_name}</td>
                                    <td>{new Date(r.request_date).toLocaleDateString()}</td>
                                    <td><span className="badge badge-medium">Pending</span></td>
                                </tr>
                            ))}
                             {activeTab === 'assets' && assignedAssets.length === 0 && <tr><td colSpan="4" className="text-center">No assigned assets found.</td></tr>}
                             {activeTab === 'requests' && pendingRequests.length === 0 && <tr><td colSpan="4" className="text-center">No pending requests.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Quick Actions */}
            <div className="dashboard-top-row">
                <div className="card full-width-col" style={{ gridColumn: '1 / -1' }}>
                    <h3>Quick Actions</h3>
                    <div className="action-grid">
                        <Link to="/assets" className="action-card-btn">
                            <span>Assign Assets</span>
                            <span className="action-arrow">→</span>
                        </Link>
                        <Link to="/requests" className="action-card-btn">
                            <span>View Requests</span>
                            <span className="action-arrow">→</span>
                        </Link>
                         <Link to="/employees" className="action-card-btn">
                            <span>Manage Employees</span>
                            <span className="action-arrow">→</span>
                        </Link>
                         <Link to="/locations" className="action-card-btn">
                            <span>Manage Rooms</span>
                            <span className="action-arrow">→</span>
                        </Link>
                        <Link to="/purchase-orders" className="action-card-btn">
                            <span>Purchase Orders</span>
                            <span className="action-arrow">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SupervisorDashboard
