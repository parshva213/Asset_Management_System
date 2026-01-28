"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"
import { useToast } from "../contexts/ToastContext"

const EmployeeDashboard = () => {
    const { user, logout } = useAuth()
    const { showError, showSuccess } = useToast()
    const [stats, setStats] = useState({
        assignedAssets: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        totalRequests: 0,
        assignedAssetsList: [],
        myRequests: []
    })
    const [loading, setLoading] = useState(true)
    
    // Details states
    const [employee, setEmployee] = useState(null)
    const [assets, setAssets] = useState([])
    const [activeTab, setActiveTab] = useState("overview")
    const [locationsAndRooms, setLocationsAndRooms] = useState([])
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [supervisorKey, setSupervisorKey] = useState("")
    const [registering, setRegistering] = useState(false)
    const [roomRegistrationModal, setRoomRegistrationModal] = useState(false)

    const fetchDashboardData = useCallback(async () => {
        try {
            const dashboardRes = await api.get("/employee/dashboard")
            setStats({
                assignedAssets: dashboardRes.data.assignedAssets || 0,
                pendingRequests: dashboardRes.data.pendingRequests || 0,
                approvedRequests: dashboardRes.data.approvedRequests || 0,
                totalRequests: dashboardRes.data.totalRequests || 0,
                assignedAssetsList: dashboardRes.data.assignedAssetsList || [],
                myRequests: dashboardRes.data.myRequests || []
            })
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            if (error.response?.status === 403) logout()
        }
    }, [logout])

    const fetchEmployeeDetails = useCallback(async () => {
        try {
            const response = await api.get("/reports/my-details")
            setEmployee(response.data)
        } catch (error) {
            console.error("Error fetching employee details:", error)
            showError("Failed to load your details")
        }
    }, [showError])

    const fetchEmployeeAssets = useCallback(async () => {
        try {
            const response = await api.get("/reports/my-assets")
            setAssets(response.data)
        } catch (error) {
            console.error("Error fetching assets:", error)
            showError("Failed to load your assets")
        }
    }, [showError])

    const fetchLocationsAndRooms = useCallback(async () => {
        try {
            const response = await api.get("/reports/locations-and-rooms")
            setLocationsAndRooms(response.data)
        } catch (error) {
            console.error("Error fetching locations and rooms:", error)
            showError("Failed to load locations and rooms")
        }
    }, [showError])

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            if (user) {
                await Promise.all([
                    fetchDashboardData(),
                    fetchEmployeeDetails(),
                    fetchEmployeeAssets(),
                    fetchLocationsAndRooms()
                ])
            }
            setLoading(false)
        }
        init()
    }, [fetchDashboardData, fetchEmployeeDetails, fetchEmployeeAssets, fetchLocationsAndRooms, user])

    const handleRegisterToRoom = async (e) => {
        e.preventDefault()

        if (!selectedRoom || !supervisorKey.trim()) {
            showError("Please select a room and enter the supervisor key")
            return
        }

        try {
            setRegistering(true)
            await api.post("/reports/register-to-room", {
                room_id: selectedRoom.id,
                supervisor_key: supervisorKey
            })

            showSuccess("Successfully registered to the room!")
            setRoomRegistrationModal(false)
            setSupervisorKey("")
            setSelectedLocation(null)
            setSelectedRoom(null)
            await fetchEmployeeDetails()
        } catch (error) {
            const message = error.response?.data?.message || "Failed to register to room"
            showError(message)
        } finally {
            setRegistering(false)
        }
    }

    if (loading) {
        return <div className="loading">Loading dashboard...</div>
    }

    return (
        <div className="dashboard-layout employee-dashboard">
            <div className="dashboard-top-row">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                            alt="Profile"
                            className="profile-avatar"
                        />
                        <div className="profile-info">
                            <h3>Hi, {user?.name} 👋</h3>
                           <span className="badge badge-high">Employee</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🏢</span> {user?.department || 'General Staff'}
                        </div>
                         <div className="profile-detail-item">
                            <span>📞</span> {user?.phone || 'Not set'}
                        </div>
                        <div className="profile-detail-item">
                            <span>📍</span> {employee?.location_name || "Not assigned"}
                        </div>
                         <div className="profile-detail-item">
                            <span>🚪</span> {employee?.room_name || "Not assigned"}
                        </div>
                    </div>
                     <div className="card-footer">
                         <Link to="/profile">
                            Update Profile →
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-2">
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#6366f1' }}>
                                💻
                            </div>
                            <div className="stat-title">My Assets</div>
                            <div className="stat-value">{stats.assignedAssets}</div>
                        </div>
                         <div className="card-footer">
                            <button onClick={() => setActiveTab("assets")} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}>
                                View Details →
                            </button>
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
                        <div className="card-footer">
                            <Link to="/requests">
                                View Details →
                            </Link>
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
                         <div className="card-footer">
                            <Link to="/requests">
                                View Details →
                            </Link>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div>
                            <div className="stat-icon-wrapper" style={{ background: '#8b5cf6' }}>
                                 ✨
                            </div>
                            <div className="stat-title">New Request</div>
                            <div className="stat-value">{stats.totalRequests}</div>
                        </div>
                        <div className="card-footer">
                             <Link to="/requests">
                                Create New →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consolidated Details Section */}
            <div className="dashboard-content-tabs" style={{ marginTop: '2rem' }}>
                <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <button 
                        className={`tab-button ${activeTab === "overview" ? "active" : ""}`} 
                        onClick={() => setActiveTab("overview")}
                        style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab-button ${activeTab === "location" ? "active" : ""}`} 
                        onClick={() => setActiveTab("location")}
                        style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'location' ? '2px solid var(--primary)' : 'none', color: activeTab === 'location' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Location & Room
                    </button>
                    <button 
                        className={`tab-button ${activeTab === "assets" ? "active" : ""}`} 
                        onClick={() => setActiveTab("assets")}
                        style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'assets' ? '2px solid var(--primary)' : 'none', color: activeTab === 'assets' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        My Assets
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === "overview" && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Personal Information</h4>
                            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="info-item">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Department</span>
                                    <span style={{ fontWeight: 600 }}>{employee?.department || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</span>
                                    <span style={{ fontWeight: 600 }}>{employee?.role}</span>
                                </div>
                                <div className="info-item">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone</span>
                                    <span style={{ fontWeight: 600 }}>{employee?.phone || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Assets</span>
                                    <span style={{ fontWeight: 600 }}>{employee?.total_assets}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "location" && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4>Location & Room Information</h4>
                                <button className="btn btn-secondary" onClick={() => setRoomRegistrationModal(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                    {employee?.location_id ? "Change Location" : "Register to Room"}
                                </button>
                            </div>
                            
                            {employee?.location_id ? (
                                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    <div className="info-item">
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Location</span>
                                        <span style={{ fontWeight: 600 }}>{employee.location_name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Address</span>
                                        <span style={{ fontWeight: 600 }}>{employee.location_address || "N/A"}</span>
                                    </div>
                                    <div className="info-item">
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Room</span>
                                        <span style={{ fontWeight: 600 }}>{employee.room_name || "Not assigned"}</span>
                                    </div>
                                    <div className="info-item">
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Room Floor</span>
                                        <span style={{ fontWeight: 600 }}>{employee.floor ? `Floor ${employee.floor}` : "N/A"}</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "1rem" }}>
                                    <p style={{ color: "var(--text-secondary)", marginBottom: '1rem' }}>You are not yet assigned to a location and room</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "assets" && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>My Assigned Assets</h4>
                            {assets.length > 0 ? (
                                <div className="table-container" style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Asset Name</th>
                                                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Serial Number</th>
                                                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Category</th>
                                                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Status</th>
                                                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Room</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assets.map((asset) => (
                                                <tr key={asset.id}>
                                                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}><strong>{asset.name}</strong></td>
                                                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{asset.serial_number || "N/A"}</td>
                                                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{asset.category_name || "Uncategorized"}</td>
                                                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                                        <span className={`badge ${asset.status === "Assigned" ? "badge-success" : "badge-info"}`}>
                                                            {asset.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{asset.room_name || "N/A"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    No assets assigned yet
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Room Registration Modal */}
            {roomRegistrationModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setRoomRegistrationModal(false)}>
                    <div className="modal-content" style={{ background: 'var(--panel)', padding: '2rem', borderRadius: '1rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Register to Room</h3>
                            <button onClick={() => setRoomRegistrationModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
                        </div>

                        <form onSubmit={handleRegisterToRoom}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Location</label>
                                <select
                                    className="form-select"
                                    value={selectedLocation?.id || ""}
                                    onChange={(e) => {
                                        const location = locationsAndRooms.find((l) => l.id === parseInt(e.target.value))
                                        setSelectedLocation(location)
                                        setSelectedRoom(null)
                                    }}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)' }}
                                >
                                    <option value="" style={{ background: 'var(--panel)' }}>Choose a location...</option>
                                    {locationsAndRooms.map((location) => (
                                        <option key={location.id} value={location.id} style={{ background: 'var(--panel)' }}>
                                            {location.name} - {location.address}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedLocation && (
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Room</label>
                                    <div className="room-list" style={{ display: 'grid', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                                        {selectedLocation.rooms && selectedLocation.rooms.length > 0 ? (
                                            selectedLocation.rooms.map((room) => {
                                                const isFull = room.current_occupancy >= room.capacity
                                                return (
                                                    <div
                                                        key={room.id}
                                                        className={`room-card ${selectedRoom?.id === room.id ? "selected" : ""}`}
                                                        onClick={() => !isFull && setSelectedRoom(room)}
                                                        style={{ 
                                                            padding: '0.75rem', 
                                                            border: selectedRoom?.id === room.id ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                                                            borderRadius: '0.5rem', 
                                                            cursor: isFull ? 'not-allowed' : 'pointer', 
                                                            opacity: isFull ? 0.5 : 1,
                                                            background: selectedRoom?.id === room.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <strong>{room.name}</strong>
                                                            {isFull && <span className="badge badge-error" style={{ fontSize: '0.7rem' }}>Full</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            Floor {room.floor} | {room.current_occupancy}/{room.capacity}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <p style={{ color: "var(--text-muted)" }}>No rooms available</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRoom && (
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Supervisor Key</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={supervisorKey}
                                        onChange={(e) => setSupervisorKey(e.target.value)}
                                        placeholder="Enter supervisor key..."
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)' }}
                                    />
                                </div>
                            )}

                            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setRoomRegistrationModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={!selectedRoom || !supervisorKey || registering}>
                                    {registering ? "Registering..." : "Register"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EmployeeDashboard

