"use client"

import { useState, useEffect } from "react"
import api from "../api"
import { useToast } from "../contexts/ToastContext"
import { useAuth } from "../contexts/AuthContext"

const SupervisorDetails = () => {
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [supervisorDetails, setSupervisorDetails] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Location & Room states
  const [locationsAndRooms, setLocationsAndRooms] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [supervisorKey, setSupervisorKey] = useState("")
  const [registering, setRegistering] = useState(false)
  const [roomRegistrationModal, setRoomRegistrationModal] = useState(false)

  // Team stats
  const [teamStats, setTeamStats] = useState({
    totalEmployees: 0,
    employeesWithAssets: 0,
    totalAssetsManaged: 0
  })

  const fetchSupervisorDetails = async () => {
    try {
      setDetailsLoading(true)
      const response = await api.get("/reports/my-details")
      setSupervisorDetails(response.data)

      // Calculate team stats
      const [teamRes] = await Promise.allSettled([
        api.get("/reports/supervisor/my-employees")
      ])

      if (teamRes.status === 'fulfilled') {
        const employees = teamRes.value.data
        setTeamStats({
          totalEmployees: employees.length,
          employeesWithAssets: employees.filter(e => e.total_assets > 0).length,
          totalAssetsManaged: employees.reduce((sum, e) => sum + (e.total_assets || 0), 0)
        })
      }
    } catch (error) {
      console.error("Error fetching supervisor details:", error)
      showError("Failed to load supervisor details")
    } finally {
      setDetailsLoading(false)
      setLoading(false)
    }
  }

  const fetchLocationsAndRooms = async () => {
    try {
      const response = await api.get("/reports/locations-and-rooms")
      setLocationsAndRooms(response.data)
      setSelectedLocation(null)
      setSelectedRoom(null)
    } catch (error) {
      console.error("Error fetching locations and rooms:", error)
      showError("Failed to load locations and rooms")
    }
  }

  const handleRegisterToRoom = async (e) => {
    e.preventDefault()

    if (!selectedRoom) {
      showError("Please select a room")
      return
    }

    if (!supervisorKey.trim()) {
      showError("Please enter your supervisor key")
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
      await fetchSupervisorDetails()
    } catch (error) {
      const message = error.response?.data?.message || "Failed to register to room"
      showError(message)
    } finally {
      setRegistering(false)
    }
  }

  useEffect(() => {
    fetchSupervisorDetails()
  }, [])

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading supervisor details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👤 My Details</h1>
        <p className="page-subtitle">Manage your profile and team assignments</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#3b82f6" }}>👥</div>
          <div className="stat-content">
            <div className="stat-label">Team Members</div>
            <div className="stat-value">{teamStats.totalEmployees}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ec4899" }}>📦</div>
          <div className="stat-content">
            <div className="stat-label">Assets Managed</div>
            <div className="stat-value">{teamStats.totalAssetsManaged}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#10b981" }}>✅</div>
          <div className="stat-content">
            <div className="stat-label">Team With Assets</div>
            <div className="stat-value">{teamStats.employeesWithAssets}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f59e0b" }}>🔑</div>
          <div className="stat-content">
            <div className="stat-label">Your Key</div>
            <div className="stat-value" style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>
              {supervisorDetails?.ownpk?.substring(0, 6)}...
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "location" ? "active" : ""}`}
            onClick={() => setActiveTab("location")}
          >
            Location & Room
          </button>
          <button
            className={`tab-btn ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            My Team
          </button>
        </div>

        {/* Tab Content */}
        <div className="tabs-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="tab-pane">
              {detailsLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="section">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Name</span>
                      <span className="value">{supervisorDetails?.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email</span>
                      <span className="value">{supervisorDetails?.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone</span>
                      <span className="value">{supervisorDetails?.phone || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Department</span>
                      <span className="value">{supervisorDetails?.department || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Role</span>
                      <span className="value badge badge-primary">{supervisorDetails?.role}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Supervisor Key</span>
                      <span className="value" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                        {supervisorDetails?.ownpk}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location & Room Tab */}
          {activeTab === "location" && (
            <div className="tab-pane">
              {detailsLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="section">
                  <h3>Location & Room Assignment</h3>
                  {supervisorDetails?.location_name ? (
                    <div className="assigned-location">
                      <div className="location-badge">📍 Location Assigned</div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Location</span>
                          <span className="value">{supervisorDetails.location_name}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Address</span>
                          <span className="value">{supervisorDetails.location_address || "N/A"}</span>
                        </div>
                        {supervisorDetails.room_name && (
                          <>
                            <div className="info-item">
                              <span className="label">Room</span>
                              <span className="value">{supervisorDetails.room_name}</span>
                            </div>
                            <div className="info-item">
                              <span className="label">Floor</span>
                              <span className="value">Floor {supervisorDetails.floor || "N/A"}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <button
                        className="btn-change"
                        onClick={() => {
                          setRoomRegistrationModal(true)
                          fetchLocationsAndRooms()
                        }}
                      >
                        Change Location/Room
                      </button>
                    </div>
                  ) : (
                    <div className="unassigned-location">
                      <p>No location assigned yet</p>
                      <button
                        className="btn-primary"
                        onClick={() => {
                          setRoomRegistrationModal(true)
                          fetchLocationsAndRooms()
                        }}
                      >
                        Register to Location & Room
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="tab-pane">
              <div className="section">
                <h3>Team Overview</h3>
                <div className="team-stats">
                  <div className="stat-summary">
                    <span className="stat-icon">👥</span>
                    <div>
                      <p className="stat-title">Total Team Members</p>
                      <p className="stat-number">{teamStats.totalEmployees}</p>
                    </div>
                  </div>
                  <div className="stat-summary">
                    <span className="stat-icon">📦</span>
                    <div>
                      <p className="stat-title">Total Assets Assigned</p>
                      <p className="stat-number">{teamStats.totalAssetsManaged}</p>
                    </div>
                  </div>
                  <div className="stat-summary">
                    <span className="stat-icon">✅</span>
                    <div>
                      <p className="stat-title">Members With Assets</p>
                      <p className="stat-number">{teamStats.employeesWithAssets}</p>
                    </div>
                  </div>
                </div>
                <p style={{ color: "var(--text-muted)", marginTop: "1.5rem", textAlign: "center" }}>
                  👉 Go to Employee Report to view detailed team information and assign assets
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Registration Modal */}
      {roomRegistrationModal && (
        <div className="modal-overlay" onClick={() => setRoomRegistrationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register to Location & Room</h2>
              <button
                className="modal-close"
                onClick={() => setRoomRegistrationModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterToRoom}>
              <div className="form-group">
                <label>Select Location</label>
                <select
                  className="form-select"
                  value={selectedLocation?.id || ""}
                  onChange={(e) => {
                    const location = locationsAndRooms.find(loc => loc.id === parseInt(e.target.value))
                    setSelectedLocation(location)
                    setSelectedRoom(null)
                  }}
                >
                  <option value="">-- Choose Location --</option>
                  {locationsAndRooms.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLocation && (
                <div className="form-group">
                  <label>Select Room</label>
                  <div className="rooms-grid">
                    {selectedLocation.rooms && selectedLocation.rooms.length > 0 ? (
                      selectedLocation.rooms.map((room) => {
                        const isFull = room.current_occupancy >= room.capacity
                        return (
                          <div
                            key={room.id}
                            className={`room-card ${selectedRoom?.id === room.id ? "selected" : ""} ${isFull ? "full" : ""}`}
                            onClick={() => !isFull && setSelectedRoom(room)}
                            style={{ cursor: isFull ? "not-allowed" : "pointer", opacity: isFull ? 0.6 : 1 }}
                          >
                            <h4>{room.name}</h4>
                            <p className="room-info">Floor {room.floor}</p>
                            <div className="room-capacity">
                              <span>{room.current_occupancy}/{room.capacity}</span>
                              <div className="capacity-bar">
                                <div
                                  className="capacity-fill"
                                  style={{
                                    width: `${(room.current_occupancy / room.capacity) * 100}%`,
                                    background: isFull ? "#ef4444" : "#10b981"
                                  }}
                                ></div>
                              </div>
                            </div>
                            {isFull && <span className="full-badge">Full</span>}
                          </div>
                        )
                      })
                    ) : (
                      <p style={{ color: "var(--text-muted)" }}>No rooms available in this location</p>
                    )}
                  </div>
                </div>
              )}

              {selectedRoom && (
                <div className="form-group">
                  <label>Supervisor Key</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your supervisor key (OWNPK)"
                    value={supervisorKey}
                    onChange={(e) => setSupervisorKey(e.target.value)}
                    required
                  />
                  <small className="form-hint">Your unique supervisor key from your profile</small>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setRoomRegistrationModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!selectedRoom || !supervisorKey.trim() || registering}
                >
                  {registering ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--primary-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tabs-container {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
        }

        .tabs-nav {
          display: flex;
          border-bottom: 2px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .tab-btn {
          flex: 1;
          padding: 1rem;
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .tabs-content {
          padding: 2rem;
        }

        .tab-pane {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section {
          margin-bottom: 2rem;
        }

        .section h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .info-item .value {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 500;
          word-break: break-all;
        }

        .assigned-location {
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 6px;
          border-left: 4px solid var(--primary-color);
        }

        .location-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: var(--primary-color);
          color: white;
          border-radius: 20px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .btn-change {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-change:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .unassigned-location {
          text-align: center;
          padding: 2rem;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .unassigned-location p {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: var(--border-color);
          color: var(--text-primary);
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          opacity: 0.8;
        }

        .team-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .stat-summary {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .stat-summary .stat-icon {
          font-size: 2rem;
        }

        .stat-summary .stat-title {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .stat-summary .stat-number {
          margin: 0.25rem 0 0 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-select,
        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.95rem;
          color: var(--text-primary);
          background: var(--bg-primary);
        }

        .form-select:focus,
        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .room-card {
          padding: 1rem;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          transition: all 0.3s ease;
          position: relative;
        }

        .room-card:hover:not(.full) {
          border-color: var(--primary-color);
          background: rgba(59, 130, 246, 0.05);
        }

        .room-card.selected {
          border-color: var(--primary-color);
          background: rgba(59, 130, 246, 0.1);
        }

        .room-card h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .room-info {
          margin: 0 0 0.75rem 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .room-capacity {
          margin-bottom: 0.5rem;
        }

        .room-capacity span {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .capacity-bar {
          width: 100%;
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          overflow: hidden;
        }

        .capacity-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .full-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #ef4444;
          color: white;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 8px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-muted);
        }

        .modal-close:hover {
          color: var(--text-primary);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .badge-primary {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--primary-color);
          color: white;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .tabs-nav {
            flex-wrap: wrap;
          }

          .tab-btn {
            flex: 0 1 auto;
            padding: 0.75rem;
            font-size: 0.85rem;
          }

          .rooms-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .modal-content {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  )
}

export default SupervisorDetails
