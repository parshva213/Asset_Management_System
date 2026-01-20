
"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"

const LocationRooms = () => {
  const [searchParams] = useSearchParams()
  const locationId = searchParams.get("location_id")
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [location, setLocation] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    floor: "",
    capacity: "",
    description: "",
    location_id: locationId
  })

  const fetchRooms = useCallback(async () => {
    try {
      // Fetch rooms specifically for this location
      // Note: Backend might need an endpoint for this, or we filter client side if the general endpoint returns all.
      // Assuming for now /api/locations/:id/rooms exists or we filter /api/locations/rooms
      // Let's rely on filtering the all-rooms endpoint for now as per previous implementation logic, 
      // but ideally we'd fetch just for this location.
      const response = await api.get("/locations/rooms")
      // Filter for this location
      const filteredRooms = response.data.filter(r => r.location_id === parseInt(locationId))
      setRooms(filteredRooms)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }, [locationId])

  const fetchLocation = useCallback(async () => {
    try {
      const response = await api.get(`/locations/${locationId}`)
      setLocation(response.data)
    } catch (error) {
        console.error("Error fetching location:", error) 
        // If 404, maybe redirect back?
    }
  }, [locationId])


  useEffect(() => {
    const loadData = async () => {
        setLoading(true)
        await Promise.all([fetchLocation(), fetchRooms()])
        setLoading(false)
    }
    loadData()
  }, [fetchLocation, fetchRooms])


  const handleRoomSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...roomFormData, location_id: locationId }
      
      if (editingRoom) {
        await api.put(`/locations/rooms/${editingRoom.id}`, payload)
      } else {
        await api.post("/locations/rooms", payload)
      }
      setShowRoomModal(false)
      setEditingRoom(null)
      resetRoomForm()
      fetchRooms()
    } catch (error) {
      console.error("Error saving room:", error)
    }
  }

  const handleEditRoom = (room) => {
    setEditingRoom(room)
    setRoomFormData({
      name: room.name,
      floor: room.floor || "",
      capacity: room.capacity || "",
      description: room.description || "",
      location_id: locationId,
    })
    setShowRoomModal(true)
  }

  const handleDeleteRoom = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await api.delete(`/locations/rooms/${id}`)
        fetchRooms()
      } catch (error) {
        console.error("Error deleting room:", error)
      }
    }
  }

  const resetRoomForm = () => {
    setRoomFormData({
      name: "",
      floor: "",
      capacity: "",
      description: "",
      location_id: locationId,
    })
  }

  const handleRoomChange = (e) => {
    setRoomFormData({ ...roomFormData, [e.target.name]: e.target.value })
  }

  if (loading) return <div className="loading">Loading rooms...</div>

  return (
    <div>
        <div className="flex-between mb-4">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate("/locations")} className="btn btn-secondary">
                    &larr; Back to Locations
                </button>
                <h2>Rooms in {location ? location.name : "Location"}</h2>
            </div>
            {user?.role === "Super Admin" && (
                <button onClick={() => setShowRoomModal(true)} className="btn btn-primary">
                    Add New Room
                </button>
            )}
        </div>

        {rooms.length === 0 ? (
            <div className="empty-state">
              <p>No rooms found for this location.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Floor</th>
                  <th>Capacity</th>
                  <th>Description</th>
                  {user?.role === "Super Admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} id={`room-${room.id}`}>
                    <td>{room.name}</td>
                    <td>{room.floor || "N/A"}</td>
                    <td>{room.capacity || "N/A"}</td>
                    <td>{room.description || "N/A"}</td>
                    {user?.role === "Super Admin" && (
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditRoom(room)} className="btn btn-secondary">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteRoom(room.id)} className="btn btn-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

      {showRoomModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingRoom ? "Edit Room" : "Add New Room"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowRoomModal(false)
                  setEditingRoom(null)
                  resetRoomForm()
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleRoomSubmit}>
                {/* Location is implied, no need to select it */}
              <div className="form-group">
                <label className="form-label">Room Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={roomFormData.name}
                  onChange={handleRoomChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input
                  type="text"
                  name="floor"
                  className="form-input"
                  value={roomFormData.floor}
                  onChange={handleRoomChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  className="form-input"
                  value={roomFormData.capacity}
                  onChange={handleRoomChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={roomFormData.description}
                  onChange={handleRoomChange}
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? "Update Room" : "Add Room"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRoomModal(false)
                    setEditingRoom(null)
                    resetRoomForm()
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationRooms
