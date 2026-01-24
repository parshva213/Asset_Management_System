"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../api"
import { useToast } from "../contexts/ToastContext"

const EmployeeDetails = () => {
  const { showError, showSuccess } = useToast()
  const [employee, setEmployee] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [locationsAndRooms, setLocationsAndRooms] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [supervisorKey, setSupervisorKey] = useState("")
  const [registering, setRegistering] = useState(false)
  const [roomRegistrationModal, setRoomRegistrationModal] = useState(false)

  const fetchEmployeeDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get("/reports/my-details")
      setEmployee(response.data)
    } catch (error) {
      console.error("Error fetching employee details:", error)
      showError("Failed to load your details")
    } finally {
      setLoading(false)
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
    fetchEmployeeDetails()
    fetchEmployeeAssets()
    fetchLocationsAndRooms()
  }, [fetchEmployeeDetails, fetchEmployeeAssets, fetchLocationsAndRooms])

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
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your details...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Unable to load employee details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p className="page-subtitle">Your location, room, and asset information</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#3b82f6" }}>📍</div>
          <div className="stat-content">
            <div className="stat-label">Location</div>
            <div className="stat-value">{employee.location_name || "Not assigned"}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#8b5cf6" }}>🚪</div>
          <div className="stat-content">
            <div className="stat-label">Room</div>
            <div className="stat-value">{employee.room_name || "Not assigned"}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ec4899" }}>📦</div>
          <div className="stat-content">
            <div className="stat-label">My Assets</div>
            <div className="stat-value">{employee.total_assets}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "location" ? "active" : ""}`}
          onClick={() => setActiveTab("location")}
        >
          Location & Room
        </button>
        <button
          className={`tab-button ${activeTab === "assets" ? "active" : ""}`}
          onClick={() => setActiveTab("assets")}
        >
          My Assets
        </button>
      </div>

      {/* Tab Content - Overview */}
      {activeTab === "overview" && (
        <div className="card">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Name</span>
              <span className="value">{employee.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{employee.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">{employee.phone || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="label">Department</span>
              <span className="value">{employee.department || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="label">Role</span>
              <span className="value">{employee.role}</span>
            </div>
            <div className="info-item">
              <span className="label">Total Assets</span>
              <span className="value">{employee.total_assets}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Location & Room */}
      {activeTab === "location" && (
        <div className="card">
          <h2>Location & Room Information</h2>
          
          {employee.location_id ? (
            <div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Current Location</span>
                  <span className="value">{employee.location_name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Address</span>
                  <span className="value">{employee.location_address || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Current Room</span>
                  <span className="value">{employee.room_name || "Not assigned"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Room Floor</span>
                  <span className="value">{employee.floor ? `Floor ${employee.floor}` : "N/A"}</span>
                </div>
              </div>
              <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                ✓ You are assigned to a location and room
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                You are not yet assigned to a location and room
              </p>
              <button
                className="btn-primary"
                onClick={() => setRoomRegistrationModal(true)}
              >
                Register to a Room
              </button>
            </div>
          )}

          {employee.location_id && (
            <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)" }}>
              <button
                className="btn-secondary"
                onClick={() => setRoomRegistrationModal(true)}
              >
                Change Location/Room
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Assets */}
      {activeTab === "assets" && (
        <div className="card">
          <h2>My Assigned Assets</h2>
          {assets.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Serial Number</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <strong>{asset.name}</strong>
                      </td>
                      <td>{asset.serial_number || "N/A"}</td>
                      <td>{asset.category_name || "Uncategorized"}</td>
                      <td>
                        <span
                          className={`badge ${
                            asset.status === "Assigned"
                              ? "badge-success"
                              : asset.status === "Available"
                              ? "badge-info"
                              : "badge-warning"
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td>{asset.location_name || "N/A"}</td>
                      <td>{asset.room_name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No assets assigned yet</p>
            </div>
          )}
        </div>
      )}

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
                  value={selectedLocation?.id || ""}
                  onChange={(e) => {
                    const location = locationsAndRooms.find((l) => l.id === parseInt(e.target.value))
                    setSelectedLocation(location)
                    setSelectedRoom(null)
                  }}
                  required
                >
                  <option value="">Choose a location...</option>
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
                  {selectedLocation.rooms && selectedLocation.rooms.length > 0 ? (
                    <div className="room-list">
                      {selectedLocation.rooms.map((room) => {
                        const isFull = room.current_occupancy >= room.capacity
                        return (
                          <div
                            key={room.id}
                            className={`room-card ${selectedRoom?.id === room.id ? "selected" : ""}`}
                            onClick={() => !isFull && setSelectedRoom(room)}
                            style={{
                              opacity: isFull ? 0.5 : 1,
                              cursor: isFull ? "not-allowed" : "pointer"
                            }}
                          >
                            <div className="room-card-header">
                              <h4>{room.name}</h4>
                              {isFull && <span className="badge badge-danger">Full</span>}
                            </div>
                            <div className="room-card-details">
                              <p><strong>Floor:</strong> {room.floor}</p>
                              <p><strong>Capacity:</strong> {room.current_occupancy}/{room.capacity}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-muted)" }}>No rooms available in this location</p>
                  )}
                </div>
              )}

              {selectedRoom && (
                <div className="form-group">
                  <label>Supervisor Key</label>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                    Enter your supervisor's key to confirm registration
                  </p>
                  <input
                    type="password"
                    value={supervisorKey}
                    onChange={(e) => setSupervisorKey(e.target.value)}
                    placeholder="Enter supervisor key..."
                    required
                  />
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
                  disabled={!selectedRoom || !supervisorKey || registering}
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
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

        .stats-grid-3 {
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
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          color: var(--primary-color);
        }

        .tab-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .card h2 {
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item .label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .info-item .value {
          font-size: 1rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        table thead {
          background: var(--bg-secondary);
        }

        table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border-color);
        }

        table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        table tbody tr:hover {
          background: var(--bg-secondary);
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-info {
          background: #dbeafe;
          color: #0c4a6e;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          background: var(--border-color);
          opacity: 0.8;
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
          max-height: 90vh;
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
          font-size: 1.5rem;
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

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.95rem;
          color: var(--text-primary);
          background: var(--bg-primary);
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .room-list {
          display: grid;
          gap: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .room-card {
          padding: 1rem;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .room-card:hover:not([style*="cursor: not-allowed"]) {
          border-color: var(--primary-color);
          background: var(--bg-secondary);
        }

        .room-card.selected {
          border-color: var(--primary-color);
          background: rgba(59, 130, 246, 0.1);
        }

        .room-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .room-card-header h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .room-card-details {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .room-card-details p {
          margin: 0.25rem 0;
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
          padding: 4rem 2rem;
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

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .stats-grid-3 {
            grid-template-columns: 1fr;
          }

          .tabs {
            flex-wrap: wrap;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  )
}

export default EmployeeDetails
