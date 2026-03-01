"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"

const SupervisorDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        totalAssets: 0,
        myAssets: 0,
        teamAssets: 0,
        availableAssets: 0,
        pendingRequests: 0,
        pendingMaintenance: 0,
        completedMaintenance: 0,
        totalRooms: 0,
        totalOrders: 0,
        activeTeam: 0,
        onLeaveTeam: 0,
        remainingOrders: 0,
        rejectedOrders: 0,
        deliveredOrders: 0,
        requestedAssetRequests: 0,
        rejectedAssetRequests: 0,
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
                    myAssets: data.myAssets || 0,
                    teamAssets: data.teamAssets || 0,
                    availableAssets: data.availableAssets || 0,
                    pendingRequests: data.pendingRequests || 0,
                    pendingMaintenance: data.pendingMaintenance || 0,
                    completedMaintenance: data.completedMaintenance || 0,
                    activeTeam: data.activeTeam || 0,
                    onLeaveTeam: data.onLeaveTeam || 0,
                    totalRooms: data.totalRooms || 0,
                    remainingOrders: data.remainingOrders || 0,
                    rejectedOrders: data.rejectedOrders || 0,
                    deliveredOrders: data.deliveredOrders || 0,
                    requestedAssetRequests: data.requestedAssetRequests || 0,
                    rejectedAssetRequests: data.rejectedAssetRequests || 0,
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
                    {/* Assets Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-indigo">📦</div>
                            <span className="widget-title">Assets</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Total</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.totalAssets : 0}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Available</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.availableAssets : 0}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            {user?.loc_id ? <Link to="/assets">View full details →</Link> : ""}
                        </div>
                    </div>

                    {/* Assigned Assets Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-blue">🏢</div>
                            <span className="widget-title">Assigned Assets</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">My Asset</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.myAssets : 0}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Team Asset</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.teamAssets : 0}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            {user?.loc_id ? <Link to="/assets">View full details →</Link> : ""}
                        </div>
                    </div>

                    {/* Team Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-rose">👥</div>
                            <span className="widget-title">Team</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Active</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.activeTeam : 0}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">On Leave</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.onLeaveTeam : 0}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            {user?.loc_id ? (
                                <Link to="/team-user">View Team →</Link>
                            ) : ""}
                        </div>
                    </div>

                    {/* Orders Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-green">🛒</div>
                            <span className="widget-title">Orders</span>
                        </div>
                        <div className="split-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="split-item left">
                                <span className="stat-label">Remaining</span>
                                <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>{user?.loc_id ? stats.remainingOrders : 0}</h3>
                            </div>
                            <div className="split-item center" style={{ borderLeft: '1px solid #eee', borderRight: '1px solid #eee', textAlign: 'center' }}>
                                <span className="stat-label">Rejected</span>
                                <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>{user?.loc_id ? stats.rejectedOrders : 0}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Delivered</span>
                                <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>{user?.loc_id ? stats.deliveredOrders : 0}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            {user?.loc_id ? <Link to="/purchase-orders">View full details →</Link> : ""}
                        </div>
                    </div>

                    {/* Maintenance Requests Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-amber">📝</div>
                            <span className="widget-title">Maintenance Requests</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Pending</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.pendingMaintenance : 0}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Completed</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.completedMaintenance : 0}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            {user?.loc_id ? <Link to="/requests">View full details →</Link> : ""}
                        </div>
                    </div>

                    {/* Location Asset Request Card */}
                    <div className="stat-widget">
                        <div className="widget-header">
                            <div className="stat-icon bg-violet">📋</div>
                            <span className="widget-title">Location Asset Request</span>
                        </div>
                        <div className="split-container">
                            <div className="split-item left">
                                <span className="stat-label">Requested</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.requestedAssetRequests : 0}</h3>
                            </div>
                            <div className="split-item right">
                                <span className="stat-label">Rejected</span>
                                <h3 className="stat-value">{user?.loc_id ? stats.rejectedAssetRequests : 0}</h3>
                            </div>
                        </div>
                        <div className="stat-footer">
                            {user?.loc_id ? <Link to="/requests">View full details →</Link> : ""}
                        </div>
                    </div>
                </div>
            </div>

            {showRoomModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Register to Location & Room</h2>
                            <button className="close-modal" onClick={() => setShowRoomModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleRegisterRoom}>
                                <div style={{marginBottom: '1.5rem'}}>
                                    <label className="form-label">Select Location</label>
                                    <select 
                                        className="form-input" 
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
                                        <label className="form-label">Select Room</label>
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

                                <div className="flex gap-2 mt-6">
                                    <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowRoomModal(false)}>
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary flex-1"
                                        disabled={registering || !selectedLocation}
                                        style={(!selectedLocation) ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                    >
                                        {registering ? "Updating..." : "Update Location"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SupervisorDashboard
