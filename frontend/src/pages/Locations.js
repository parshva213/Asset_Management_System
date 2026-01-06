"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import api from "../api"
import useCrud from "../hooks/useCrud"

const Locations = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items: locations, loading: locationsLoading, error: locError, create: createLocation, update: updateLocation, remove: removeLocation, list: listLocations } = useCrud("locations")
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [locationFormData, setLocationFormData] = useState({
    name: "",
    address: "",
    description: "",
  })

  useEffect(() => {
    listLocations()
  }, [])

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
        {user?.role === "Super Admin" && (
            <button
                className="btn btn-primary"
                onClick={() => setShowLocationModal(true)}
            >
                Add New Location
            </button>
        )}
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
                        {user?.role === "Super Admin" && (
                            <>
                                <button onClick={() => handleEditLocation(location)} className="btn btn-secondary">
                                Edit
                                </button>
                                <button onClick={() => handleDeleteLocation(location.id)} className="btn btn-danger">
                                Delete
                                </button>
                            </>
                        )}
                        <button onClick={() => navigate(`/rooms?location_id=${location.id}`)} className="btn btn-secondary">
                          Rooms
                        </button>
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
    </div>
  )
}

export default Locations
