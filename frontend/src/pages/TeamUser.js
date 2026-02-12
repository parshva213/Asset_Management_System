"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"

const TeamUser = () => {
  useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [locationName, setLocationName] = useState("")
  const [derivedLocationId, setDerivedLocationId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Granular Modal States
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeModal, setActiveModal] = useState(null) // 'location', 'assets'
  const [modalLoading, setModalLoading] = useState(false)
  const [locations, setLocations] = useState([])
  const [rooms, setRooms] = useState([])
  const [newLocationId, setNewLocationId] = useState("")
  const [newRoomId, setNewRoomId] = useState("")
  const [currentAsset, setCurrentAsset] = useState(null)
  const [availableAssets, setAvailableAssets] = useState([])
  const [assetsToAssign, setAssetsToAssign] = useState([])
  const [assetsToUnassign, setAssetsToUnassign] = useState([])
  
  // Track previous location to detect actual changes
  const prevLocationIdRef = useRef(null)

  const locid = searchParams.get("locid")
  const roomid = searchParams.get("roomid")
  const role = searchParams.get("role")

  console.log("TeamUser Params - locid:", locid, "roomid:", roomid, "role:", role)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(searchParams)
      if (locid) {
        params.delete("locid")
        params.append("location_id", locid)
      }
      if (roomid) {
        params.delete("roomid")
        params.append("room_id", roomid)
      }
      const url = `/users?${params.toString()}`
      console.log("TeamUser Fetching Users URL:", url)
      const response = await api.get(url)
      console.log("TeamUser Received Users:", response.data)
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [searchParams, locid, roomid])

  const fetchLocationName = useCallback(async () => {
    try {
      if (locid) {
        const response = await api.get(`/locations/${locid}`)
        setLocationName(response.data.name)
        setDerivedLocationId(locid)
      } else if (roomid) {
        console.log("TeamUser Fetching Room Name for ID:", roomid)
        const response = await api.get(`/locations/rooms/${roomid}`)
        console.log("TeamUser Room Response:", response.data)
        setLocationName(`${response.data.name} in ${response.data.location_name}`)
        // Store the location_id from the room data for back navigation
        setDerivedLocationId(response.data.location_id)
      }
    } catch (error) {
      console.error("Error fetching location name:", error)
    }
  }, [locid, roomid])

  const fetchLocations = useCallback(async () => {
    try {
      const response = await api.get("/locations")
      setLocations(response.data)
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }, [])


  const fetchRooms = useCallback(async (locationId) => {
    try {
      if (!locationId) {
        setRooms([])
        return
      }
      const response = await api.get(`/locations/${locationId}/rooms`)
      setRooms(response.data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
    }
  }, [])

  const fetchCurrentAsset = useCallback(async (userId) => {
    try {
      const response = await api.get(`/assets/current-asset/${userId}`)
      setCurrentAsset(response.data)
    } catch (error) {
      console.error("Error fetching current asset:", error)
    }
  }, [])

  const fetchAvailableAssets = useCallback(async (locId = null) => {
    try {
      let url = "/assets/available-assets-to-assign/" + locId;
      const response = await api.get(url)
      setAvailableAssets(response.data)
    } catch (error) {
      console.error("Error fetching available assets:", error)
    }
  }, [])


  useEffect(() => {
    fetchUsers()
    fetchLocations()
    if (locid || roomid) {
      fetchLocationName()
    }
    if (locid) {
      fetchRooms(locid)
    }
  }, [locid, roomid, role, fetchUsers, fetchLocationName, fetchLocations, fetchRooms])

  const handleOpenModal = (user, type) => {
    setSelectedUser(user)
    setActiveModal(type)
    if (type === 'location') {
      setNewLocationId(user.loc_id || "")
      setNewRoomId(user.room_id || "")
      
      // Reset ref so we don't clear the room on initial render
      prevLocationIdRef.current = null
      
      // Fetch rooms for the user's current location
      if (user.loc_id) {
        fetchRooms(user.loc_id)
      }
    } else if (type === 'assets') {
      fetchCurrentAsset(user.id)
      fetchAvailableAssets(user.loc_id)
      setAssetsToAssign([])
      setAssetsToUnassign([])
    }
  }

  // Fetch rooms when location changes in the modal
  useEffect(() => {
    if (activeModal === 'location' && newLocationId) {
      fetchRooms(newLocationId)
      
      // Only reset room if location actually changed (not on initial modal open)
      if (prevLocationIdRef.current !== null && prevLocationIdRef.current !== newLocationId) {
        setNewRoomId("")
      }
      
      // Update the ref to track current location
      prevLocationIdRef.current = newLocationId
    }
  }, [newLocationId, activeModal, fetchRooms])

  const handleCloseModal = () => {
    setSelectedUser(null)
    setActiveModal(null)
    setNewLocationId("")
    setCurrentAsset(null)
    setAvailableAssets([])
    setAssetsToAssign([])
    setAssetsToUnassign([])
  }

  const handleSaveLocation = async () => {
    if (!selectedUser || !newLocationId) return
    setModalLoading(true)
    try {
      const updateData = { loc_id: newLocationId, room_id: newRoomId || null }
      await api.put(`/users/${selectedUser.id}`, updateData)
      await fetchUsers()
      handleCloseModal()
    } catch (error) {
      console.error("Error updating location:", error)
    } finally {
      setModalLoading(false)
    }
  }

  const toggleAssignAsset = (assetId) => {
    setAssetsToAssign(prev => 
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    )
  }

  const toggleUnassignAsset = (assetId) => {
    setAssetsToUnassign(prev => 
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    )
  }

  const handleSaveAssets = async () => {
    if (!selectedUser) return
    setModalLoading(true)
    try {
      // Process assignments
      for (const assetId of assetsToAssign) {
        await api.post("/users/assign-asset", { user_id: selectedUser.id, asset_id: assetId })
      }
      // Process unassignments
      for (const assetId of assetsToUnassign) {
        await api.post("/users/unassign-asset", { user_id: selectedUser.id, asset_id: assetId })
      }
      await fetchUsers()
      handleCloseModal()
    } catch (error) {
      console.error("Error updating assets:", error)
    } finally {
      setModalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  const title = roomid ? "Team (Supervisor & Employees) in " + locationName : "Maintenance Team at " + locationName

  return (
    <div className="content">
      <div className="flex-between mb-4">
        <div>
          <button 
            onClick={() => navigate(roomid ? `/rooms?location_id=${locid || derivedLocationId}` : "/locations")} 
            className="btn btn-secondary mb-2"
            style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}
          >
            ← {roomid ? "Back to Rooms" : "Back to Locations"}
          </button>
          <h2>{title}</h2>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found for this filter.</p>
        </div>
      ) : (
        <div className="user-grid">
          {users.map((user) => (
            <div key={user.id} className="card user-card" id={`user-${user.id}`}>
              <div className="card-header flex-between">
                <div>
                  <h3 className="text-lg font-bold">{user.name}</h3>
                </div>
                <span className="badge badge-primary">{user.role}</span>
              </div>
              <div className="card-body">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Department:</strong> {user.department || "N/A"}</p>
                <p><strong>Assigned Assets:</strong> {user.assigned_assets?.length || 0}</p>
              </div>
              <div className="card-footer">
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleOpenModal(user, 'location')}
                >
                  Change Location
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={() => handleOpenModal(user, 'assets')}
                >
                  Assets
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modals */}
      {activeModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header flex-col items-start gap-4">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-xl font-bold">
                  {activeModal === 'location' && `Change Location - ${selectedUser.name}`}
                  {activeModal === 'assets' && `Manage Assets - ${selectedUser.name}`}
                </h2>
                <button className="close-modal" onClick={handleCloseModal}>&times;</button>
              </div>
              
            </div>
            
            <div className="modal-body">
              {activeModal === 'location' && (
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Select New Location</label>
                    <select 
                      className="form-input" 
                      value={newLocationId} 
                      onChange={(e) => {
                        setNewLocationId(e.target.value)
                        setNewRoomId("") // Reset room when location changes
                      }}
                    >
                      <option value="">Select Location</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Select New Room</label>
                    <select 
                      className="form-input" 
                      value={newRoomId} 
                      onChange={(e) => setNewRoomId(e.target.value)}
                    >
                      <option value="">Select Room</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>  
              )}
              {activeModal === 'assets' && (
                <div className="assets-modal-content">
                  {/* Assigned Assets Section */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-secondary border-b pb-2 flex justify-between items-center">
                      <span>Currently Assigned</span>
                      <span className="text-xs font-normal">({currentAsset?.length || 0})</span>
                    </h4>
                    {currentAsset?.length === 0 ? (
                      <p className="text-sm text-secondary italic px-2 py-3 bg-light/30 rounded">No assets currently assigned.</p>
                    ) : (
                      <div className="assigned-checkbox-list space-y-1">
                        {currentAsset?.map(asset => (
                          <label key={asset.id} className="flex items-center gap-2 p-2 rounded hover:bg-light cursor-pointer border border-transparent hover:border-border transition-all">
                            <input 
                              type="checkbox" 
                              checked={!assetsToUnassign.includes(asset.id)}
                              onChange={() => toggleUnassignAsset(asset.id)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium">{asset.name}</span>
                              <br />
                              <span className="text-xs text-secondary">Serial Number: {asset.serial_number}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Assets Section */}
                  <div className="available-assets-section border-t pt-6">
                    <h4 className="mb-4 text-secondary border-b pb-2 flex justify-between items-center">
                      <span>Available for Assignment</span>
                      <span className="text-xs font-normal">at {selectedUser.location_name || 'Organization'}</span>
                    </h4>


                    {availableAssets.length === 0 ? (
                      <p className="text-sm text-secondary italic px-2 py-4 text-center bg-light/30 rounded">No available assets for this location.</p>
                    ) : (
                      <div className="available-checkbox-list space-y-1">
                        {availableAssets
                          ?.filter(asset => !selectedUser.assigned_assets?.some(assigned => assigned.name === asset.name))
                          .map(asset => (
                            <label key={asset.available_min_id} className="flex items-center gap-3 p-3 rounded hover:bg-light cursor-pointer border border-transparent hover:border-border transition-all group">
                              <input 
                                type="checkbox" 
                                checked={assetsToAssign.includes(asset.available_min_id)}
                                onChange={() => toggleAssignAsset(asset.available_min_id)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                                <div className="text-sm font-semibold group-hover:text-primary transition-colors">
                                {asset.name}
                                </div>
                                <div className="text-[11px] text-secondary flex gap-2">
                                  <span>(Qty: {asset.total_assets || 0} | Available: {asset.available_assets || 0} | Assigned: {asset.assigned_assets || 0})</span>
                                </div>
                            </label>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary flex-1" 
                onClick={handleCloseModal}
                disabled={modalLoading}
              >
                Cancel
              </button>
              {activeModal === 'location' && (
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={handleSaveLocation}
                  disabled={modalLoading || (String(newLocationId) === String(selectedUser.loc_id) && String(newRoomId) === String(selectedUser.room_id))}
                >
                  {modalLoading ? "Saving..." : "Save Location"}
                </button>
              )}
              {activeModal === 'assets' && (
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={handleSaveAssets}
                  disabled={modalLoading || (assetsToAssign.length === 0 && assetsToUnassign.length === 0)}
                >
                  {modalLoading ? "Saving..." : `Save Changes (${assetsToAssign.length + assetsToUnassign.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamUser
