"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"
import useCrud from "../hooks/useCrud"

const Locations = () => {
  const { user } = useAuth()
  const { items: locations, loading: locationsLoading, error: locError, create: createLocation, update: updateLocation, remove: removeLocation, list: listLocations } = useCrud("locations")
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [activeTab, setActiveTab] = useState("locations")
  const [locationFormData, setLocationFormData] = useState({
    name: "",
    address: "",
    description: "",
  })
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    floor: "",
    capacity: "",
    description: "",
    location_id: "",
  })

  useEffect(() => {
    listLocations()
    fetchRooms()
  }, [])

  useEffect(() => {
    if (!locationsLoading) setLoading(false)
  }, [locationsLoading])

  const fetchRooms = async () => {
    try {
      const response = await api.get("/locations/rooms")
      setRooms(response.data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }

  const handleLocationSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, locationFormData)
      } else {
        await createLocation(locationFormData)
      }
      setShowLocationModal(false)
      setEditingLocation(null)
      resetLocationForm()
      // Optimistic update already applied by hook
    } catch (error) {
      console.error("Error saving location:", error)
    }
  }

  const handleRoomSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRoom) {
        await api.put(`/locations/rooms/${editingRoom.id}`, roomFormData)
      } else {
        await api.post("/locations/rooms", roomFormData)
      }
      setShowRoomModal(false)
      setEditingRoom(null)
      resetRoomForm()
      fetchRooms()
    } catch (error) {
      console.error("Error saving room:", error)
    }
  }

  const handleEditLocation = (location) => {
    setEditingLocation(location)
    setLocationFormData({
      name: location.name,
      address: location.address || "",
      description: location.description || "",
    })
    setShowLocationModal(true)
  }

  const handleEditRoom = (room) => {
    setEditingRoom(room)
    setRoomFormData({
      name: room.name,
      floor: room.floor || "",
      capacity: room.capacity || "",
      description: room.description || "",
      location_id: room.location_id || "",
    })
    setShowRoomModal(true)
  }

  const handleDeleteLocation = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await removeLocation(id)
      } catch (error) {
        console.error("Error deleting location:", error)
      }
    }
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

  const resetLocationForm = () => {
    setLocationFormData({
      name: "",
      address: "",
      description: "",
    })
  }

  const resetRoomForm = () => {
    setRoomFormData({
      name: "",
      floor: "",
      capacity: "",
      description: "",
      location_id: "",
    })
  }

  const handleLocationChange = (e) => {
    setLocationFormData({ ...locationFormData, [e.target.name]: e.target.value })
  }

  const handleRoomChange = (e) => {
    setRoomFormData({ ...roomFormData, [e.target.name]: e.target.value })
  }

  if (loading) {
    return <div className="loading">Loading locations...</div>
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>{user?.role === "IT Supervisor" ? "Room Management" : "Locations & Rooms Management"}</h2>

      </div>

      {user?.role === "Super Admin" && (
        <div className="tabs mb-4">
          <button
            className={`btn ${activeTab === "locations" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("locations")}
          >
            Locations
          </button>
          <button
            className={`btn ${activeTab === "rooms" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("rooms")}
          >
            Rooms
          </button>
        </div>
      )}

      {activeTab === "locations" && user?.role === "Super Admin" && (
        <>
          {locations.length === 0 ? (
            <div className="empty-state">
              <p>No locations found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id}>
                    <td>{location.name}</td>
                    <td>{location.address || "N/A"}</td>
                    <td>{location.description || "N/A"}</td>
                    <td>{new Date(location.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditLocation(location)} className="btn btn-secondary">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {(activeTab === "rooms" || user?.role === "IT Supervisor") && (
        <>
          {rooms.length === 0 ? (
            <div className="empty-state">
              <p>No rooms found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Floor</th>
                  <th>Capacity</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.name}</td>
                    <td>{room.floor || "N/A"}</td>
                    <td>{room.capacity || "N/A"}</td>
                    <td>{room.location_name || "N/A"}</td>
                    <td>{room.description || "N/A"}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditRoom(room)} className="btn btn-secondary">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {showLocationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingLocation ? "Edit Location" : "Add New Location"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowLocationModal(false)
                  setEditingLocation(null)
                  resetLocationForm()
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleLocationSubmit}>
              <div className="form-group">
                <label className="form-label">Location Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={locationFormData.name}
                  onChange={handleLocationChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-input"
                  value={locationFormData.address}
                  onChange={handleLocationChange}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={locationFormData.description}
                  onChange={handleLocationChange}
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingLocation ? "Update Location" : "Add Location"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLocationModal(false)
                    setEditingLocation(null)
                    resetLocationForm()
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
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
                <label className="form-label">Location</label>
                <select
                  name="location_id"
                  className="form-select"
                  value={roomFormData.location_id}
                  onChange={handleRoomChange}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
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

export default Locations
