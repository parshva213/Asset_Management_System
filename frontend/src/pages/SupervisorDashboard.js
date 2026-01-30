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
        maintenanceRequests: 0,
        totalRooms: 0,
        totalOrders: 0,
        departmentUsers: 0,
        assignedAssetsList: [],
        pendingRequestsList: []
    })
    const [loading, setLoading] = useState(true)
    
    // Room Registration Modal State
    const [showRoomModal, setShowRoomModal] = useState(false)
    const [locations, setLocations] = useState([])
    const [rooms, setRooms] = useState([])
    const [selectedLocation, setSelectedLocation] = useState("")
    const [selectedRoom, setSelectedRoom] = useState("")
    const [registering, setRegistering] = useState(false)

    const fetchDashboardData = useCallback(async () => {
        try {
            const [dashboardRes] = await Promise.allSettled([
                api.get("/supervisor/dashboard")
            ])

            if (dashboardRes.status === 'fulfilled') {
                const data = dashboardRes.value.data
                setStats({
                    totalAssets: data.totalAssets || 0,
                    assignedAssets: data.assignedAssets || 0,
                    availableAssets: data.availableAssets || 0,
                    pendingRequests: data.pendingRequests || 0,
                    departmentUsers: data.departmentUsers || 0,
                    totalRooms: data.totalRooms || 0,
                    totalOrders: data.totalOrders || 0,
                    assignedAssetsList: data.assignedAssetsList || [],
                    pendingRequestsList: data.pendingRequestsList || []
                })
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

    // Load locations when modal opens
    useEffect(() => {
        if (showRoomModal) {
            fetchLocations()
        }
    }, [showRoomModal])

    const fetchLocations = async () => {
        try {
            const response = await api.get("/locations")
            setLocations(response.data)
        } catch (error) {
            console.error("Error fetching locations:", error)
        }
    }

    const handleLocationChange = async (e) => {
        const locationId = e.target.value
        setSelectedLocation(locationId)
        setSelectedRoom("") // Reset room
        if (locationId) {
            try {
                const response = await api.get("/locations/rooms")
                const filtered = response.data.filter(r => r.location_id === parseInt(locationId))
                setRooms(filtered)
            } catch (error) {
                console.error("Error fetching rooms:", error)
            }
        } else {
            setRooms([])
        }
    }

    const handleRegisterRoom = async (e) => {
        e.preventDefault()
        if (!selectedLocation) return
        
        setRegistering(true)
        try {
            await api.put(`/users/${user.id}`, {
                loc_id: selectedLocation,
                room_id: selectedRoom || null 
            })
            
            // Refresh dashboard/user data
            // Assuming updateProfile refetches user or we reload
            window.location.reload() 
        } catch (error) {
            console.error("Error updating room:", error)
        } finally {
            setRegistering(false)
        }
    }

    const getInitials = (name) => {
        if (!name) return "U"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    }

    if (loading) {
        return <div className="loading">Loading dashboard...</div>
    }

    return (
        <div className="dashboard-layout supervisor-dashboard">
            <div className="dashboard-top-row">
                {/* Profile Card */}
                <div className="profile-card-new">
                    <div className="profile-header-new">
                        <div className="avatar-circle">
                            {getInitials(user?.name)}
                        </div>
                        <div className="profile-greeting">
                            <h3>Hi, {user?.name || "Supervisor"}</h3>
                            <span className="waving-hand">👋</span>
                            <span className="role-badge-new">Supervisor</span>
                        </div>
                    </div>
                    <div className="profile-details-new">
                        <div className="info-row">
                            <span className="info-icon">📧</span> {user?.email}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">📞</span> {user?.phone || "Not set"}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">🛡️</span> {user?.role} - {user?.department || "General"}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">🔑</span> {user?.ownpk || "Not set"}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">📍</span> {user?.room_name || "Not assigned"}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">🏢</span> {user?.location_name || "Not assigned"}
                        </div>
                    </div>
                    <div className="profile-footer-new">
                        <Link to="/profile">Update Profile →</Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-3">
                    {/* Team Members */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new purple">👥</div>
                            <span className="stat-label-new">Team Members</span>
                            <h3 className="stat-value-new" style={!user?.loc_id ? { fontSize: '1.25rem' } : {}}>
                                {user?.loc_id ? stats.departmentUsers : "Location not set"}
                            </h3>
                        </div>
                        <div className="stat-footer-new">
                            {user?.loc_id ? (
                                <Link to="/users">View Details →</Link>
                            ) : (
                                    ""
                            )}
                        </div>
                    </div>

                    {/* Assigned Assets */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new green">📦</div>
                            <span className="stat-label-new">Assigned Assets</span>
                            <h3 className="stat-value-new" style={!user?.loc_id ? { fontSize: '1.25rem' } : {}}>
                                {user?.loc_id ? stats.assignedAssets : "Location not set"}
                            </h3>
                        </div>
                        <div className="stat-footer-new">
                            {user?.loc_id ? (
                                <Link to="/assets">View full details →</Link>
                            ) : ""}
                        </div>
                    </div>

                    {/* Location Assets */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new blue">🏢</div>
                            <span className="stat-label-new">Location Assets</span>
                            <h3 className="stat-value-new" style={!user?.loc_id ? { fontSize: '1.25rem' } : {}}>
                                {user?.loc_id ? stats.totalAssets : "Location not set"}
                            </h3>
                        </div>
                        <div className="stat-footer-new">
                            {user?.loc_id ? (
                                <Link to="/assets">View full details →</Link>
                            ) : ""}
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new orange">📝</div>
                            <span className="stat-label-new">Pending Req.</span>
                            <h3 className="stat-value-new" style={!user?.loc_id ? { fontSize: '1.25rem' } : {}}>
                                {user?.loc_id ? stats.pendingRequests : "Location not set"}
                            </h3>
                        </div>
                        <div className="stat-footer-new">
                            {user?.loc_id ? (
                                <Link to="/requests">View full details →</Link>
                            ) : ""}
                        </div>
                    </div>

                    {/* Orders */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new cyan">🛒</div>
                            <span className="stat-label-new">Orders</span>
                            <h3 className="stat-value-new" style={!user?.loc_id ? { fontSize: '1.25rem' } : {}}>
                                {user?.loc_id ? stats.totalOrders : "Location not set"}
                            </h3>
                        </div>
                        <div className="stat-footer-new">
                            {user?.loc_id ? (
                                <Link to="/purchase-orders">View full details →</Link>
                            ) : ""}
                        </div>
                    </div>

                    {/* Room Status */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new purple">📍</div>
                            <span className="stat-label-new">Room Status</span>
                            <h3 className="stat-value-new" style={{ fontSize: '1.5rem' }}>
                                {user?.room_name || "Not assigned"}
                            </h3>
                            <span className="stat-label-new" style={{ marginTop: '0.25rem' }}>
                                {user?.location_name || "No location set"}
                            </span>
                        </div>
                        <div className="stat-footer-new">
                            <button onClick={() => setShowRoomModal(true)}>Register Now →</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Room Registration Modal New Design */}
            {showRoomModal && (
                <div className="modal-overlay">
                    <div className="modal-new">
                        <div className="modal-header-new">
                            <h3 className="modal-title-new">Register to Location & Room</h3>
                            <button className="close-btn-new" onClick={() => setShowRoomModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleRegisterRoom}>
                            <div style={{marginBottom: '1.5rem'}}>
                                <label className="form-label-new">Select Location</label>
                                <select 
                                    className="form-select-new" 
                                    value={selectedLocation} 
                                    onChange={handleLocationChange}
                                    required
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {selectedLocation && (
                                <div>
                                    <label className="form-label-new">Select Room</label>
                                    {rooms.length > 0 ? (
                                        <div className="room-grid">
                                            {rooms.map(room => {
                                                const occupancy = room.current_occupancy || 0
                                                const capacity = room.capacity || 10
                                                const percentage = Math.min((occupancy / capacity) * 100, 100)
                                                const isSelected = selectedRoom === room.id
                                                
                                                return (
                                                    <div 
                                                        key={room.id} 
                                                        className={`room-card ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => setSelectedRoom(room.id)}
                                                    >
                                                        <div className="room-name">{room.name}</div>
                                                        <div className="room-floor">Floor {room.floor}</div>
                                                        <div className="progress-container">
                                                            <div className="progress-label">
                                                                <span>{occupancy}/{capacity}</span>
                                                            </div>
                                                            <div className="progress-bar-bg">
                                                                <div 
                                                                    className={`progress-bar-fill ${percentage >= 100 ? 'full' : percentage >= 80 ? 'near-full' : ''}`} 
                                                                    style={{width: `${percentage}%`}}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p style={{color: '#94a3b8', fontStyle: 'italic'}}>No rooms available in this location.</p>
                                    )}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowRoomModal(false)}>
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={`btn-save ${selectedLocation && (selectedRoom || rooms.length ===0) ? 'active' : ''}`} 
                                    disabled={registering || !selectedLocation}
                                    style={(!selectedLocation) ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                >
                                    {registering ? "Updating..." : "Update Location"}
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
