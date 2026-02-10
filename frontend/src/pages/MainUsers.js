"use client"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"

const MainUsers = () => {
  // const { user } = useAuth()
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
  const [categories, setCategories] = useState([])
  const [filterType, setFilterType] = useState("All")
  const [filterCategory, setFilterCategory] = useState("All")
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
      const url = `/users/maintenance?location_id=${locid}`
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [])

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
    fetchCategories()
    if (locid) {
      fetchLocationName()
    }
  }, [locid, role, fetchUsers, fetchLocationName, fetchLocations, fetchCategories])

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

  // const handleRoleChange = async (userId, newRole) => {
  //   try {
  //     await api.put(`/users/${userId}`, { role: newRole })
  //     await fetchUsers()
  //   } catch (error) {
  //     console.error("Error changing role:", error)
  //   }
  // }

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
          {users?.map((u) => (
            <div key={u.id} className="card user-card" id={`user-${u.id}`}>
              <div className="card-header flex-between">
                <div>
                  <h3 className="text-lg font-bold">{u.name}</h3>
                </div>
                {/* {user.role === "Super Admin" ? (
                  <>
                    <select 
                    className="form-select"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value={u.role}>{u.role}</option>
                      {u.role !== "Employee" && <option value="Employee">Employee</option>}
                      {u.role !== "Maintenance" && <option value="Maintenance">Maintenance</option>}
                      {u.role !== "Supervisor" && <option value="Supervisor">Supervisor</option>}
                    </select>
                  </>
                ) : (
                  <span className="badge badge-primary">{u.role}</span>
                )} */}
                  <span className="badge badge-primary">{u.role}</span>

              </div>
              <div className="card-body">
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Department:</strong> {u.department || "N/A"}</p>
                <p><strong>Assigned Assets:</strong> {u.assigned_assets?.length || 0}</p>
              </div>
              <div className="card-footer">
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleOpenModal(u, 'location')}
                >
                  Change Location
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={() => handleOpenModal(u, 'assets')}
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
                    {locations?.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {activeModal === 'assets' && (
                <div className="assets-modal-content">
                  {/* Assigned Assets Section */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-secondary border-b pb-2 flex justify-between items-center">
                      <span>Currently Assigned</span>
                      <span className="text-xs font-normal">({selectedUser.assigned_assets?.length || 0})</span>
                    </h4>
                    {selectedUser.assigned_assets?.length === 0 ? (
                      <p className="text-sm text-secondary italic px-2 py-3 bg-light/30 rounded">No assets currently assigned.</p>
                    ) : (
                      <div className="assigned-checkbox-list space-y-1">
                        {selectedUser.assigned_assets?.map(asset => (
                          <label key={asset.id} className="flex items-center gap-2 p-2 rounded hover:bg-light cursor-pointer border border-transparent hover:border-border transition-all">
                            <input 
                              type="checkbox" 
                              checked={!assetsToUnassign.includes(asset.id)}
                              onChange={() => toggleUnassignAsset(asset.id)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">{asset.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Assets Section with Filters */}
                  <div className="available-assets-section border-t pt-6">
                    <h4 className="mb-4 text-secondary border-b pb-2 flex justify-between items-center">
                      <span>Available for Assignment</span>
                      <span className="text-xs font-normal">at {selectedUser.location_name || 'Organization'}</span>
                    </h4>

                    {/* Filter Controls */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="filter-item">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-secondary mb-1 block">Type</label>
                        <select 
                          className="form-input text-sm py-2"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="All">All Types</option>
                          <option value="Hardware">Hardware</option>
                          <option value="Software">Software</option>
                        </select>
                      </div>
                      <div className="filter-item">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-secondary mb-1 block">Category</label>
                        <select 
                          className="form-input text-sm py-2"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <option value="All">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {availableAssets.filter(asset => {
                        const matchesType = filterType === "All" || asset.asset_type === filterType;
                        const matchesCat = filterCategory === "All" || asset.category_name === filterCategory;
                        const isAssigned = selectedUser.assigned_assets?.some(a => a.name === asset.name);
                        return matchesType && matchesCat && !isAssigned;
                    }).length === 0 ? (
                      <p className="text-sm text-secondary italic px-2 py-4 text-center bg-light/30 rounded">No available assets match your filters.</p>
                    ) : (
                      <div className="available-checkbox-list space-y-1">
                        {availableAssets?.filter(asset => {
                            const matchesType = filterType === "All" || asset.asset_type === filterType;
                            const matchesCat = filterCategory === "All" || asset.category_name === filterCategory;
                            const isAssigned = selectedUser.assigned_assets?.some(a => a.name === asset.name);
                            return matchesType && matchesCat && !isAssigned;
                          }).map(asset => (
                            <label key={asset.id} className="flex items-center gap-3 p-3 rounded hover:bg-light cursor-pointer border border-transparent hover:border-border transition-all group">
                              <input 
                                type="checkbox" 
                                checked={assetsToAssign.includes(asset.id)}
                                onChange={() => toggleAssignAsset(asset.id)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-semibold group-hover:text-primary transition-colors">{asset.name}</div>
                                <div className="text-[11px] text-secondary flex gap-2">
                                  <span>Qty: {asset.quantity || 0}</span>
                                  <span>•</span>
                                  <span>Avail: {asset.available_total || 0}</span>
                                  <span>•</span>
                                  <span className="capitalize">{(asset.asset_type || 'N/A').toLowerCase()}</span>
                                </div>
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
