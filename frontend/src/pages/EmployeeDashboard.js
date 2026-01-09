"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"

const EmployeeDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        assignedAssets: 0,
        pendingRequests: 0,
        approvedRequests: 0,
    })
    const [myAssets, setMyAssets] = useState([])
    const [myRequests, setMyRequests] = useState([])
    const [activeTab, setActiveTab] = useState('assets')
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        try {
            const [dashboardRes, assetsRes, requestsRes] = await Promise.allSettled([
                api.get("/dashboard"),
                api.get("/assets"), // Check if backend sends only 'my' assets or all
                api.get("/requests") // Check if backend sends only 'my' requests
            ])

            if (dashboardRes.status === 'fulfilled') {
                const data = dashboardRes.value.data
                setStats({
                    assignedAssets: data.assignedAssets || 0,
                    pendingRequests: data.pendingRequests || 0,
                    approvedRequests: data.approvedRequests || 0,
                })
            }

            if (assetsRes.status === 'fulfilled' && Array.isArray(assetsRes.value.data)) {
                 // Client-side filter if backend sends all (fallback)
                 // Assuming user object has 'id' or 'email' matching assignment
                 setMyAssets(assetsRes.value.data.filter(a => a.assigned_to === user?.name || a.assigned_to_id === user?.id).slice(0, 5))
            }

            if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value.data)) {
                 // Client-side filter
                 setMyRequests(requestsRes.value.data.filter(r => r.user_id === user?.id || r.requested_by === user?.name).slice(0, 5))
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            if (error.response?.status === 403) logout()
        } finally {
            setLoading(false)
        }
    }, [logout, user])

    useEffect(() => {
        if(user) fetchDashboardData()
    }, [fetchDashboardData, user])

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
                            <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '500' }}>Employee</span>
                        </div>
                    </div>
                    <div className="profile-details">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🏢</span> {user?.department || 'General Staff'}
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
                                💻
                            </div>
                            <div className="stat-title">My Assets</div>
                            <div className="stat-value">{stats.assignedAssets}</div>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#f59e0b' }}>
                                ⏳
                            </div>
                            <div className="stat-title">Pending Req.</div>
                            <div className="stat-value">{stats.pendingRequests}</div>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                                ✅
                            </div>
                            <div className="stat-title">Approved</div>
                            <div className="stat-value">{stats.approvedRequests}</div>
                        </div>
                    </div>
                     <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#3b82f6' }}>
                                🔔
                            </div>
                            <div className="stat-title">Notifications</div>
                            <div className="stat-value">0</div>
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
                            My Assets
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            My Requests
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
                                        <th>Assigned Date</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Asset</th>
                                        <th>Request Date</th>
                                        <th>Status</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'assets' && myAssets.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.name}</td>
                                    <td>{a.model}</td>
                                    <td>{a.serial_number}</td>
                                    <td>{a.assigned_date ? new Date(a.assigned_date).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                            {activeTab === 'requests' && myRequests.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.asset_name}</td>
                                    <td>{new Date(r.request_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${r.status === 'Approved' ? 'badge-high' : 'badge-medium'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                             {activeTab === 'assets' && myAssets.length === 0 && <tr><td colSpan="4" className="text-center">No assets assigned.</td></tr>}
                             {activeTab === 'requests' && myRequests.length === 0 && <tr><td colSpan="3" className="text-center">No requests found.</td></tr>}
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
                            <span>View My Assets</span>
                            <span className="action-arrow">→</span>
                        </Link>
                        <Link to="/requests" className="action-card-btn">
                            <span>New Request</span>
                            <span className="action-arrow">→</span>
                        </Link>
                         <Link to="/requests" className="action-card-btn">
                            <span>Track Requests</span>
                            <span className="action-arrow">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeDashboard
