"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useCrud from "../hooks/useCrud"
import RoomsModal from "../components/RoomsModal"
import { formatDate } from "../utils/dateUtils"

const Locations = () => {
  const navigate = useNavigate()
  const { items: locations, loading: locationsLoading, create: createLocation, update: updateLocation, remove: removeLocation, list: listLocations } = useCrud("locations")
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showRoomsModal, setShowRoomsModal] = useState(false)
  const [selectedLocationForRooms, setSelectedLocationForRooms] = useState(null)
  const [editingLocation, setEditingLocation] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [locationFormData, setLocationFormData] = useState({
    name: "",
    address: "",
    description: "",
  })

  useEffect(() => {
    listLocations()
  }, [listLocations])

  useEffect(() => {
    if (!locationsLoading) setLoading(false)
  }, [locationsLoading])

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
    } catch (error) {
      console.error("Error saving location:", error)
    }
    window.location.reload()
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

  const handleDeleteLocation = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await removeLocation(id)
      } catch (error) {
        console.error("Error deleting location:", error)
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

  const handleLocationChange = (e) => {
    setLocationFormData({ ...locationFormData, [e.target.name]: e.target.value })
  }

  if (loading) {
    return <div className="loading">Loading locations...</div>
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Locations Management</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowLocationModal(true)}
            >
              Add New Location
            </button>
      </div>

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
                  <th>Rooms</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} id={`loc-${location.id}`}>
                    <td>{location.name}</td>
                    <td>{location.address || "N/A"}</td>
                    <td>{location.room_count}</td>
                    <td>{location.description || "N/A"}</td>
                    <td>{formatDate(location.created_at)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditLocation(location)} className="btn btn-secondary">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteLocation(location.id)} className="btn btn-danger">
                          Delete
                        </button>
                        <div className="dropdown-container">
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === location.id ? null : location.id)} 
                            className="btn btn-secondary"
                          >
                            View ▼
                          </button>
                          {openDropdownId === location.id && (
                            <div className="dropdown-menu">
                              <button
                                onClick={() => {
                                  setSelectedLocationForRooms(location)
                                  setShowRoomsModal(true)
                                  setOpenDropdownId(null)
                                }}
                                className="dropdown-item"
                              >
                                Rooms
                              </button>
                              <button
                                onClick={() => {
                                  navigate(`/main-users?location_id=${location.id}`)
                                  setOpenDropdownId(null)
                                }}
                                className="dropdown-item"
                              >
                                Maintenance Team
                              </button>
                              <button
                                onClick={() => {
                                  navigate(`/assets?location_id=${location.id}`)
                                  setOpenDropdownId(null)
                                }}
                                className="dropdown-item"
                              >
                                Assets
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {showRoomsModal && selectedLocationForRooms && (
        <RoomsModal 
          locationId={selectedLocationForRooms.id}
          locationName={selectedLocationForRooms.name}
          onClose={() => {
            setShowRoomsModal(false)
            setSelectedLocationForRooms(null)
          }}
        />
      )}
    </div>
  )
}

export default Locations
