"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"
import { useToast } from "../contexts/ToastContext"

const SupervisorDashboard = () => {
    const { user, logout } = useAuth()
    const { showError, showSuccess } = useToast()
    const [stats, setStats] = useState({
        totalAssets: 0,
        assignedAssets: 0,
        availableAssets: 0,
        pendingRequests: 0,
        maintenanceRequests: 0,
        totalRooms: 0,
        totalOrders: 0,
        assignedAssetsList: [],
        pendingRequestsList: []
    })
    const [loading, setLoading] = useState(true)

    // Details states
    const [supervisorDetails, setSupervisorDetails] = useState(null)
    const [activeTab, setActiveTab] = useState("overview")
    const [locationsAndRooms, setLocationsAndRooms] = useState([])
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [supervisorKey, setSupervisorKey] = useState("")
    const [registering, setRegistering] = useState(false)
    const [roomRegistrationModal, setRoomRegistrationModal] = useState(false)
    const [teamStats, setTeamStats] = useState({
        totalEmployees: 0,
        employeesWithAssets: 0,
        totalAssetsManaged: 0
    })

    const fetchDashboardData = useCallback(async (locId) => {
        try {
            const dashboardRes = await api.get(`/supervisor/dashboard${locId ? `?location_id=${locId}` : ''}`)
            const data = dashboardRes.data
            setStats({
                totalAssets: data.totalAssets || 0,
                assignedAssets: data.assignedAssets || 0,
                availableAssets: data.availableAssets || 0,
                pendingRequests: data.pendingRequests || 0,
                departmentUsers: data.departmentUsers || 0,
                totalRooms: data.totalRooms || 0,
                totalOrders: data.totalOrders || 0,
                locationAssets: data.locationAssets || 0,
                assignedAssetsList: data.assignedAssetsList || [],
                pendingRequestsList: data.pendingRequestsList || []
            })
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            if (error.response?.status === 403) logout()
        }
    }, [logout])

    const fetchSupervisorDetails = useCallback(async () => {
        try {
            const response = await api.get("/reports/my-details")
            setSupervisorDetails(response.data)

            // Calculate team stats
            const teamRes = await api.get("/reports/supervisor/my-employees")
            const employees = teamRes.data
            setTeamStats({
                totalEmployees: employees.length,
                employeesWithAssets: employees.filter(e => e.total_assets > 0).length,
                totalAssetsManaged: employees.reduce((sum, e) => sum + (e.total_assets || 0), 0)
            })
            return response.data; // Return for immediate use
        } catch (error) {
            console.error("Error fetching supervisor details:", error)
            showError("Failed to load your details")
            return null;
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
                // 1. Fetch details and get location_id immediately
                const details = await fetchSupervisorDetails()
                
                // 2. Fetch dashboard stats using that location_id
                // Also fetch locations/rooms for the registration modal
                await Promise.all([
                    fetchDashboardData(details?.location_id),
                    fetchLocationsAndRooms()
                ])
            }
            setLoading(false)
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const handleRegisterToRoom = async (e) => {
        e.preventDefault()

        if (!selectedRoom || !supervisorKey.trim()) {
            showError("Please select a room and enter your supervisor key")
            return
        }

        try {
            setRegistering(true)
            await api.post("/reports/register-to-room", {
                room_id: selectedRoom.id,
                supervisor_key: supervisorKey
            })

            showSuccess("Successfully registered to room!")
            setRoomRegistrationModal(false)
            setSupervisorKey("")
            setSelectedLocation(null)
            setSelectedRoom(null)
            await fetchSupervisorDetails()
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
        <div className="dashboard-layout supervisor-dashboard">
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
                           <span className="badge badge-high">Supervisor</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="profile-detail-item">
                            <span>📧</span> {user?.email}
                        </div>
                        <div className="profile-detail-item">
                            <span>🛡️</span> {user?.role} - {user?.department || 'General'}
                        </div>
                        <div className="profile-detail-item">
                            <span>🔑</span> {supervisorDetails?.ownpk || 'Not set'}
                        </div>
                        <div className="profile-detail-item">
                            <span>📍</span> {supervisorDetails?.location_name || "Not assigned"}
                        </div>
                        <div className="profile-detail-item">
                            <span>🚪</span> {supervisorDetails?.room_name || "Not assigned"}
                        </div>
                    </div>
                    <div className="card-footer">
                        <Link to="/profile">
                            Update Profile →
                        </Link>
                    </div>
                </div>

                {/* Stats Grid Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* First Line Grid - 3 items */}
                    <div className="stats-grid-3">
                        <div className="stat-widget">
                            <div>
                                <div className="stat-icon-wrapper" style={{background: '#8b5cf6'}}>
                                    👥
                                </div>
                                <div className="stat-title">Team Members</div>
                                <div className="stat-value">{teamStats.totalEmployees}</div>
                            </div>
                            <div className="card-footer">
                                <Link to="/supervisor-report">
                                    View Details →
                                </Link>
                            </div>
                        </div>
                        <div className="stat-widget">
                            <div>
                                <div className="stat-icon-wrapper" style={{background: '#10b981'}}>
                                    📦
                                </div>
                                <div className="stat-title">Assigned Assets</div>
                                <div className="stat-value">{stats.assignedAssets}</div>
                            </div>
                            <div className="card-footer">
                                <Link to="/assets">
                                    View Details →
                                </Link>
                            </div>
                        </div>
                        <div className="stat-widget">
                            <div>
                                <div className="stat-icon-wrapper" style={{background: '#3b82f6'}}>
                                    🏢
                                </div>
                                <div className="stat-title">Location Assets</div>
                                <div className="stat-value">{stats.locationAssets}</div>
                            </div>
                            <div className="card-footer">
                                <Link to={`/assets?location_id=${supervisorDetails?.location_id}`}>
                                    View Details →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Second Line Grid - 2 items */}
                    <div className="stats-grid-2">
                        <div className="stat-widget">
                            <div>
                                <div className="stat-icon-wrapper" style={{background: '#f59e0b'}}>
                                    📝
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
                                <div className="stat-icon-wrapper" style={{background: '#06b6d4'}}>
                                    🛒
                                </div>
                                <div className="stat-title">Orders</div>
                                <div className="stat-value">{stats.totalOrders}</div>
                            </div>
                            <div className="card-footer">
                                <Link to="/purchase-orders">
                                    View Details →
                                </Link>
                            </div>
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
                        className={`tab-button ${activeTab === "team" ? "active" : ""}`} 
                        onClick={() => setActiveTab("team")}
                        style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'team' ? '2px solid var(--primary)' : 'none', color: activeTab === 'team' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        My Team
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === "overview" && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Supervisor Information</h4>
                            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="info-item">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Department</span>
                                    <span style={{ fontWeight: 600 }}>{supervisorDetails?.department || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</span>
                                    <span style={{ fontWeight: 600 }}>{supervisorDetails?.role}</span>
                                </div>
                                <div className="info-item">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone</span>
                                    <span style={{ fontWeight: 600 }}>{supervisorDetails?.phone || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Own Key (OWNPK)</span>
                                    <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)' }}>{supervisorDetails?.ownpk}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "location" && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4>Location & Room Assignment</h4>
                                <button className="btn btn-secondary" onClick={() => { setRoomRegistrationModal(true); fetchLocationsAndRooms(); }} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                    {supervisorDetails?.location_name ? "Change Location" : "Register to Room"}
                                </button>
                            </div>
                            
                            {supervisorDetails?.location_name ? (
                                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    <div className="info-item">
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Location</span>
                                        <span style={{ fontWeight: 600 }}>{supervisorDetails.location_name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Address</span>
                                        <span style={{ fontWeight: 600 }}>{supervisorDetails.location_address || "N/A"}</span>
                                    </div>
                                    <div className="info-item">
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Room</span>
                                        <span style={{ fontWeight: 600 }}>{supervisorDetails.room_name || "Not assigned"}</span>
                                    </div>
                                    <div className="info-item">
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Floor</span>
                                        <span style={{ fontWeight: 600 }}>{supervisorDetails.floor ? `Floor ${supervisorDetails.floor}` : "N/A"}</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "1rem" }}>
                                    <p style={{ color: "var(--text-secondary)", marginBottom: '1rem' }}>No location assigned yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "team" && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4>Team Overview</h4>
                                <Link to="/supervisor-report" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                                    Detailed Report →
                                </Link>
                            </div>
                            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="info-item" style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '0.5rem' }}>
                                    <span style={{ display: 'block', fontSize: '2rem' }}>👥</span>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Team Members</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{teamStats.totalEmployees}</span>
                                </div>
                                <div className="info-item" style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '0.5rem' }}>
                                    <span style={{ display: 'block', fontSize: '2rem' }}>📦</span>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Assets Managed</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{teamStats.totalAssetsManaged}</span>
                                </div>
                                <div className="info-item" style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '0.5rem' }}>
                                    <span style={{ display: 'block', fontSize: '2rem' }}>✅</span>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.5rem' }}>With Assets</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{teamStats.employeesWithAssets}</span>
                                </div>
                            </div>
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
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Supervisor Key (OWNPK)</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={supervisorKey}
                                        onChange={(e) => setSupervisorKey(e.target.value)}
                                        placeholder="Enter your OWN key to confirm..."
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

export default SupervisorDashboard

