
"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import { formatDate } from "../utils/dateUtils"

const LocationRooms = () => {
  const [searchParams] = useSearchParams()
  const locationId = searchParams.get("location_id")
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  
  const [location, setLocation] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showAssetsModal, setShowAssetsModal] = useState(false)
  const [locationAssets, setLocationAssets] = useState([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    floor: "",
    capacity: "",
    description: "",
    location_id: locationId
  })

  const fetchRooms = useCallback(async () => {
    try {
      const response = await api.get("/locations/rooms")
      const filteredRooms = response.data.filter(r => r.location_id === parseInt(locationId))
      setRooms(filteredRooms)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }, [locationId])

  const fetchLocationAssets = useCallback(async () => {
    try {
      setAssetsLoading(true)
      const response = await api.get(`/assets?location_id=${locationId}&role=Maintenance`)
      setLocationAssets(response.data)
    } catch (err) { 
      console.error("Error fetching location assets:", err)
    } finally {
      setAssetsLoading(false)
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
        showSuccess("Room updated successfully")
      } else {
        await api.post("/locations/rooms", payload)
        showSuccess("Room created successfully")
      }
      setShowRoomModal(false)
      setEditingRoom(null)
      resetRoomForm()
      fetchRooms()
    } catch (error) {
      console.error("Error saving room:", error)
      showError("Error saving room")
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
            <div className="flex items-center gap-2">
                {user?.role === "Super Admin" && (
                    <>
                        <button 
                            onClick={() => {
                                fetchLocationAssets()
                                setShowAssetsModal(true)
                            }} 
                            className="btn btn-secondary"
                        >
                            Maintaince assets view
                        </button>
                        <button onClick={() => setShowRoomModal(true)} className="btn btn-primary">
                            Add New Room
                        </button>
                    </>
                )}
            </div>
        </div>

        {rooms.length === 0 ? (
            <div className="empty-state">
              <p>No rooms found for this location.</p>
            </div>
          ) : (
            <div className="table-container">
                <table className="table">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Floor</th>
                    <th>Capacity </th>
                    <th>Users</th>
                    <th>Assets</th>
                    <th>Assigned</th>
                    <th>Description</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room) => (
                    <tr key={room.id} id={`room-${room.id}`}>
                        <td>{room.name}</td>
                        <td>{room.floor}</td>
                        <td>{room.capacity}</td>
                        <td>{room.current_occupancy}</td>
                        <td>{room.asset_count}</td>
                        <td>{room.assigned_count}</td>
                        <td>{room.description || "N/A"}</td>
                        <td>
                          <div className="flex gap-2">
                            {user?.role === "Super Admin" && (
                              <>
                                <button onClick={() => handleEditRoom(room)} className="btn btn-secondary">
                                  Edit
                                </button>
                                <div className="dropdown-container">
                              <button 
                                onClick={() => setOpenDropdownId(openDropdownId === room.id ? null : room.id)} 
                                className="btn btn-secondary"
                              >
                                View ►
                              </button>
                              {openDropdownId === room.id && (
                                <div className="dropdown-menu">
                                  <button
                                    onClick={() => {
                                      navigate(`/team-user?locid=${locationId}&roomid=${room.id}`)
                                      setOpenDropdownId(null)
                                    }}
                                    className="dropdown-item"
                                  >
                                    Team
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigate(`/lr-assets?locid=${locationId}&roomid=${room.id}`)
                                      setOpenDropdownId(null)
                                    }}
                                    className="dropdown-item"
                                  >
                                    Assets
                                  </button>
                                </div>
                              )}
                            </div>
                              </>
                            )}
                          </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          )}

      {showRoomModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRoom ? "Edit Room" : "Add New Room"}</h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowRoomModal(false)
                  setEditingRoom(null)
                  resetRoomForm()
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
                <form onSubmit={handleRoomSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
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
                </form>
            </div>
            <div className="modal-footer">
                <div className="flex gap-2" style={{ width: '100%' }}>
                    <button onClick={handleRoomSubmit} className="btn btn-primary" style={{flex: 1}}>
                    {editingRoom ? "Update Room" : "Add Room"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        style={{flex: 1}}
                        onClick={() => {
                            setShowRoomModal(false)
                            setEditingRoom(null)
                            resetRoomForm()
                        }}
                    >
                    Cancel
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {showAssetsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '1400px', width: '98%' }}>
            <div className="modal-header">
              <h2>Maintenance Assets View</h2>
              <button
                className="close-modal"
                onClick={() => setShowAssetsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {assetsLoading ? (
                <div className="loading">Loading assets...</div>
              ) : locationAssets.length === 0 ? (
                <div className="empty-state">
                  <p>No assets found for this location</p>
                </div>
              ) : (
                <div className="table-container" style={{ overflowX: 'auto', width: '100%', padding: '0', border: 'none', boxShadow: 'none' }}>
                    <table className="table" style={{ width: '100%', minWidth: '1300px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                        <th style={{ whiteSpace: 'nowrap' }}>Asset Name</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Assigned To</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Type</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Serial Number</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Warranty Expiry</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Category</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Purchase Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locationAssets.map((asset, index) => (
                        <tr key={index}>
                            <td style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>{asset.aname}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{asset.uname}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{asset.asset_type}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{asset.serial_number || "N/A"}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(asset.warranty_expiry)}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{asset.cat_name || "N/A"}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(asset.purchase_date)}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationRooms
