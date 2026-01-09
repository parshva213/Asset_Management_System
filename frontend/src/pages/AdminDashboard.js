"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        totalAssets: 0,
        assignedAssets: 0,
        availableAssets: 0,
        pendingRequests: 0,
        totalUsers: 0,
        departmentUsers: 0,
    })
    const [recentUsers, setRecentUsers] = useState([])
    const [recentRequests, setRecentRequests] = useState([])
    const [activeTab, setActiveTab] = useState('users')
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        try {
            // Parallel fetch for efficiency
            const [dashboardRes, usersRes, requestsRes] = await Promise.allSettled([
                api.get("/dashboard"),
                api.get("/users?limit=5"), // Attempting to limit if supported
                api.get("/requests?status=Pending&limit=5")
            ])
            
            // Handle Dashboard Stats
            if (dashboardRes.status === 'fulfilled') {
                const data = dashboardRes.value.data
                setStats({
                    totalAssets: data.totalAssets || 0,
                    assignedAssets: data.assignedAssets || 0,
                    availableAssets: data.availableAssets || 0,
                    pendingRequests: data.pendingRequests || 0,
                    totalUsers: data.totalUsers || 0,
                    departmentUsers: data.departmentUsers || 0,
                })
            }

            // Handle Lists (Default to empty if failed or not arrays)
            if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)) {
                setRecentUsers(usersRes.value.data.slice(0, 5))
            } else if (usersRes.status === 'fulfilled' && usersRes.value.data.users) {
                 // Handle if response is { users: [...] }
                setRecentUsers(usersRes.value.data.users.slice(0, 5))
            }

            if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value.data)) {
                setRecentRequests(requestsRes.value.data.filter(r => r.status === 'Pending').slice(0, 5))
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
                            <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '500' }}>Administrative Access</span>
                        </div>
                    </div>
                    <div className="profile-details">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🛡️</span> {user?.role}
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
                            <div className="stat-title">Pending Req.</div>
                            <div className="stat-value">{stats.pendingRequests}</div>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#f43f5e' }}>
                                👥
                            </div>
                            <div className="stat-title">Total Users</div>
                            <div className="stat-value">{stats.totalUsers}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="table-container">
                <div className="table-header-row">
                    <div className="tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Recent Users
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
                                {activeTab === 'users' ? (
                                    <>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
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
                            {activeTab === 'users' && recentUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td><span className="badge badge-medium">{u.role}</span></td>
                                    <td><span className="badge badge-high">{u.status || 'Active'}</span></td>
                                </tr>
                            ))}
                            {activeTab === 'requests' && recentRequests.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.asset_name}</td>
                                    <td>{r.user_name}</td>
                                    <td>{new Date(r.request_date).toLocaleDateString()}</td>
                                    <td><span className="badge badge-medium">Pending</span></td>
                                </tr>
                            ))}
                             {activeTab === 'users' && recentUsers.length === 0 && <tr><td colSpan="4" className="text-center">No recent new users.</td></tr>}
                             {activeTab === 'requests' && recentRequests.length === 0 && <tr><td colSpan="4" className="text-center">No pending requests.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-top-row">
                <div className="card full-width-col" style={{ gridColumn: '1 / -1' }}>
                    <h3>Quick Actions</h3>
                    <div className="action-grid">
                        <Link to="/employees" className="action-card-btn">
                            <span>Manage Users</span>
                            <span className="action-arrow">→</span>
                        </Link>
                        <Link to="/assets" className="action-card-btn">
                            <span>Manage Assets</span>
                            <span className="action-arrow">→</span>
                        </Link>
                        <Link to="/requests" className="action-card-btn">
                            <span>View All Requests</span>
                            <span className="action-arrow">→</span>
                        </Link>
                        <Link to="/categories" className="action-card-btn">
                            <span>Categories</span>
                            <span className="action-arrow">→</span>
                        </Link>
                         <Link to="/locations" className="action-card-btn">
                            <span>Locations</span>
                            <span className="action-arrow">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
