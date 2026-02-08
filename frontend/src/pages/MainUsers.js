"use client"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"

const MainUsers = () => {
  useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [locationName, setLocationName] = useState("")
  const [loading, setLoading] = useState(true)

  // Granular Modal States
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeModal, setActiveModal] = useState(null) // 'location', 'assets'
  const [modalLoading, setModalLoading] = useState(false)
  const [locations, setLocations] = useState([])
  const [newLocationId, setNewLocationId] = useState("")
  const [availableAssets, setAvailableAssets] = useState([])
  const [assetsToAssign, setAssetsToAssign] = useState([])
  const [assetsToUnassign, setAssetsToUnassign] = useState([])

  const locid = searchParams.get("locid")
  const role = searchParams.get("role")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(searchParams)
      if (locid) {
        params.delete("locid")
        params.append("location_id", locid)
      }
      const url = `/users?${params.toString()}`
      const response = await api.get(url)
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [searchParams, locid])

  const fetchLocationName = useCallback(async () => {
    try {
      if (locid) {
        const response = await api.get(`/locations/${locid}`)
        setLocationName(response.data.name)
      }
    } catch (error) {
      console.error("Error fetching location name:", error)
    }
  }, [locid])

  const fetchLocations = useCallback(async () => {
    try {
      const response = await api.get("/locations")
      setLocations(response.data)
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }, [])

  const fetchAvailableAssets = useCallback(async (locId = null) => {
    try {
      let url = "/assets?status=Available";
      if (locId) {
        url += `&location_id=${locId}`;
      }
      const response = await api.get(url)
      setAvailableAssets(response.data)
    } catch (error) {
      console.error("Error fetching available assets:", error)
    }
  }, [])


  useEffect(() => {
    fetchUsers()
    fetchLocations()
    if (locid) {
      fetchLocationName()
    }
  }, [locid, role, fetchUsers, fetchLocationName, fetchLocations])

  const handleOpenModal = (user, type) => {
    setSelectedUser(user)
    setActiveModal(type)
    if (type === 'location') {
      setNewLocationId(user.loc_id || "")
    } else if (type === 'assets') {
      fetchAvailableAssets(user.loc_id)
      setAssetsToAssign([])
      setAssetsToUnassign([])
    }
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
    setActiveModal(null)
    setNewLocationId("")
    setAvailableAssets([])
    setAssetsToAssign([])
    setAssetsToUnassign([])
  }

  const handleSaveLocation = async () => {
    if (!selectedUser || !newLocationId) return
    setModalLoading(true)
    try {
      await api.put(`/users/${selectedUser.id}`, { loc_id: newLocationId })
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

  const title = locid ? "Maintenance Team at " + locationName : "Users Management"

  return (
    <div className="content">
      <div className="flex-between mb-4">
        <div>
          {locid && (
            <button 
              onClick={() => navigate("/locations")} 
              className="btn btn-secondary mb-2"
              style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}
            >
              ← Back to Locations
            </button>
          )}
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
                <p><strong>Location:</strong> {user.location_name || "Unassigned"}</p>
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
            <div className="modal-header">
              <h2>
                {activeModal === 'location' && `Change Location - ${selectedUser.name}`}
                {activeModal === 'assets' && `Manage Assets - ${selectedUser.name}`}
              </h2>
              <button className="close-modal" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              {activeModal === 'location' && (
                <div className="form-group">
                  <label className="form-label">Select New Location</label>
                  <select 
                    className="form-input" 
                    value={newLocationId} 
                    onChange={(e) => setNewLocationId(e.target.value)}
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {activeModal === 'assets' && (
                <div className="assets-modal-content">
                  <div className="mb-6">
                    <h4 className="mb-3 text-secondary border-b pb-2">Currently Assigned</h4>
                    {selectedUser.assigned_assets?.length === 0 ? (
                      <p className="text-sm text-secondary italic px-2">No assets currently assigned.</p>
                    ) : (
                      <div className="assigned-checkbox-list space-y-1 max-h-40 overflow-y-auto pr-2">
                        {selectedUser.assigned_assets.map(asset => (
                          <label key={asset.id} className="flex items-center gap-2 p-2 rounded hover:bg-light cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!assetsToUnassign.includes(asset.id)}
                              onChange={() => toggleUnassignAsset(asset.id)}
                            />
                            <span className="text-sm">{asset.name} (Qty: {asset.quantity || "N/A"})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-3 text-secondary border-b pb-2">Available for Assignment at {selectedUser.location_name || 'this location'}</h4>
                    {availableAssets.length === 0 ? (
                      <p className="text-sm text-secondary italic px-2">No assets available for assignment.</p>
                    ) : (
                      <div className="available-checkbox-list space-y-1 max-h-48 overflow-y-auto pr-2">
                        {availableAssets.map(asset => (
                          <label key={asset.id} className="flex items-center gap-2 p-2 rounded hover:bg-light cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={assetsToAssign.includes(asset.id)}
                              onChange={() => toggleAssignAsset(asset.id)}
                            />
                            <span className="text-sm">{asset.name} (Qty: {asset.quantity || "N/A"})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary flex-1" onClick={handleCloseModal}>Cancel</button>
              {activeModal === 'location' && (
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={handleSaveLocation}
                  disabled={modalLoading || String(newLocationId) === String(selectedUser.loc_id)}
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

export default MainUsers
