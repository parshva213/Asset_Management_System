"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useCrud from "../hooks/useCrud"
import { useToast } from "../contexts/ToastContext"

const Locations = () => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { items: locations, loading: locationsLoading, create: createLocation, update: updateLocation, remove: removeLocation, list: listLocations } = useCrud("locations")
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
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
        showSuccess("Location updated successfully")
      } else {
        await createLocation(locationFormData)
        showSuccess("Location created successfully")
      }
      setShowLocationModal(false)
      setEditingLocation(null)
      resetLocationForm()
      // Refresh locations list instead of reload if possible, but the original used reload
      listLocations() 
    } catch (error) {
      console.error("Error saving location:", error)
      showError("Error saving location")
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
        showSuccess("Location deleted successfully")
        listLocations()
      } catch (error) {
        console.error("Error deleting location:", error)
        showError("Error deleting location")
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
            <div className="table-container">
                <table className="table">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Rooms</th>
                    <th> Assets</th>
                    <th>Description</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map((location) => (
                    <tr key={location.id} id={`loc-${location.id}`}>
                        <td>{location.name}</td>
                        <td>{location.address || "N/A"}</td>
                        <td>{location.room_count} </td><td> {location.asset_count}</td>
                        <td>{location.description || "N/A"}</td>
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
                                    navigate(`/rooms?location_id=${location.id}`)
                                    setOpenDropdownId(null)
                                    }}
                                    className="dropdown-item"
                                >
                                    Rooms
                                </button>
                                <button
                                    onClick={() => {
                                    navigate(`/mainusers?locid=${location.id}`)
                                    setOpenDropdownId(null)
                                    }}
                                    className="dropdown-item"
                                >
                                    Maintenance Team
                                </button>
                                <button
                                    onClick={() => {
                                    navigate(`/lr-assets?lid=${location.id}`)
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
            </div>
          )}

      {showLocationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingLocation ? "Edit Location" : "Add New Location"}</h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowLocationModal(false)
                  setEditingLocation(null)
                  resetLocationForm()
                }}
              >
                ×
              </button>
            </div>
             <div className="modal-body">
              <form onSubmit={handleLocationSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
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
                    rows="1"
                    />
                </div>
              </form>
            </div>
            <div className="flex gap-2 modal-footer">
              <button type="submit" className="btn btn-primary" style={{flex: 1}}>
              {editingLocation ? "Update Location" : "Add Location"}
              </button>
              <button
              type="button"
              className="btn btn-secondary"
              style={{flex: 1}}
              onClick={() => {
                  setShowLocationModal(false)
                  setEditingLocation(null)
                  resetLocationForm()
              }}
              >
              Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Locations
