"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import api from "../api"
import { formatDate } from "../utils/dateUtils"

const EmployeeDashboard = () => {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState({
        assignedAssets: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        totalRequests: 0,
        assignedAssetsList: [],
        myRequests: []
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
        } finally {
            setLoading(false)
        }
    }, [logout])

    useEffect(() => {
        if(user) fetchDashboardData()
    }, [fetchDashboardData, user])

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
            
            // Reload to reflect changes
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
        <div className="dashboard-layout employee-dashboard">


            <div className="dashboard-top-row">
                {/* Profile Card */}
                <div className="profile-card-new">
                    <div className="profile-header-new">
                        <div className="avatar-circle">
                            {getInitials(user?.name)}
                        </div>
                        <div className="profile-greeting">
                            <h3>Hi, {user?.name || "Employee"}</h3>
                            <span className="waving-hand">👋</span>
                            <span className="role-badge-new">Employee</span>
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
                            <span className="info-icon">📍</span> {user?.room_name || "Not assigned"}
                        </div>
                        <div className="info-row">
                            <span className="info-icon">🏢</span> {user?.location_name || "Not assigned"}
                        </div>
                    </div>
                    <div className="profile-footer-new" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Link to="/profile">Update Profile →</Link>
                        <button onClick={() => setShowRoomModal(true)} style={{background:'none', border:'none', color:'#6366f1', fontWeight:'600', cursor:'pointer', fontSize:'0.9rem'}}>Update Location →</button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-2">
                    {/* My Assets */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new blue">💻</div>
                            <span className="stat-label-new">My Assets</span>
                            <h3 className="stat-value-new">{stats.assignedAssets}</h3>
                        </div>
                        <div className="stat-footer-new">
                            <Link to="/assets">View full details →</Link>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new orange">⏳</div>
                            <span className="stat-label-new">Pending Req.</span>
                            <h3 className="stat-value-new">{stats.pendingRequests}</h3>
                        </div>
                        <div className="stat-footer-new">
                            <Link to="/requests">View full details →</Link>
                        </div>
                    </div>

                    {/* Approved Requests */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new green">✅</div>
                            <span className="stat-label-new">Approved</span>
                            <h3 className="stat-value-new">{stats.approvedRequests}</h3>
                        </div>
                        <div className="stat-footer-new">
                            <Link to="/requests">View full details →</Link>
                        </div>
                    </div>

                    {/* New Request */}
                    <div className="stat-widget-new">
                        <div>
                            <div className="stat-icon-new purple">✨</div>
                            <span className="stat-label-new">Total Requests</span>
                            <h3 className="stat-value-new">{stats.totalRequests}</h3>
                        </div>
                        <div className="stat-footer-new">
                            <Link to="/requests">Create New →</Link>
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
                                                // const isFull = occupancy >= capacity && room.id !== user.room_id 
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

export default EmployeeDashboard
