"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"

const Users = () => {
  useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Assignment Modal States
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState(1) // 1: Location, 2: Assets
  const [selectedUser, setSelectedUser] = useState(null)
  const [availableAssets, setAvailableAssets] = useState([])
  const [locations, setLocations] = useState([])
  const [assignForm, setAssignForm] = useState({ asset_ids: [], location_id: "" })
  const [modalLoading, setModalLoading] = useState(false)
  const [locationError, setLocationError] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/users`
      const response = await api.get(url)
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAvailableAssets = useCallback(async (locationId = null) => {
    try {
      let url = "/assets?status=Available";
      if (locationId) {
        url += `&location_id=${locationId}`;
      }
      const response = await api.get(url)
      setAvailableAssets(response.data)
    } catch (error) {
      console.error("Error fetching available assets:", error)
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

  useEffect(() => {
    fetchUsers()
    fetchAvailableAssets()
    fetchLocations()
  }, [fetchUsers, fetchAvailableAssets, fetchLocations])

  const handleOpenModal = (user) => {
    setSelectedUser(user)
    setAssignForm({ asset_ids: [], location_id: user.loc_id || "" })
    setModalStep(1)
    setLocationError(false)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedUser(null)
    setModalStep(1)
    setLocationError(false)
  }

  const fetchAssetsForStep2 = async () => {
    if (!assignForm.location_id) {
      setLocationError(true);
      return;
    }
    setLocationError(false);
    setModalLoading(true);
    try {
      // Update location immediately as requested
      await api.put(`/users/${selectedUser.id}`, { loc_id: assignForm.location_id });
      await fetchAvailableAssets(assignForm.location_id);
      setModalStep(2);
    } catch (error) {
      console.error("Error updating location:", error);
    } finally {
      setModalLoading(false);
    }
  }

  const handleCancelAssignment = async () => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      // Update location to null on cancel as requested
      await api.put(`/users/${selectedUser.id}`, { loc_id: null });
      await fetchUsers(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error("Error clearing location:", error);
    } finally {
      setModalLoading(false);
    }
  }

  const toggleAssetSelection = (assetId) => {
    setAssignForm(prev => {
      const isSelected = prev.asset_ids.includes(assetId);
      if (isSelected) {
        return { ...prev, asset_ids: prev.asset_ids.filter(id => id !== assetId) };
      } else {
        return { ...prev, asset_ids: [...prev.asset_ids, assetId] };
      }
    });
  }

  const handleUnassignAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to unassign this asset?")) return
    setModalLoading(true)
    try {
      await api.post("/users/unassign-asset", { user_id: selectedUser.id, asset_id: assetId })
      // Update local state
      const updatedUser = {
        ...selectedUser,
        assigned_assets: selectedUser.assigned_assets.filter(a => a.id !== assetId)
      }
      setSelectedUser(updatedUser)
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u))
      if (modalStep === 2) {
        fetchAvailableAssets(assignForm.location_id);
      } else {
        fetchAvailableAssets();
      }
    } catch (error) {
      console.error("Error unassigning asset:", error)
    } finally {
      setModalLoading(false)
    }
  }

  const handleSaveAssignment = async () => {
    setModalLoading(true)
    try {
      // 2. Assign Assets if selected
      if (assignForm.asset_ids.length > 0) {
        for (const assetId of assignForm.asset_ids) {
          await api.post("/users/assign-asset", { 
            user_id: selectedUser.id, 
            asset_id: assetId 
          })
        }
      }

      await fetchUsers()
      handleCloseModal()
    } catch (error) {
      console.error("Error saving assignment:", error)
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


  return (
    <div className="content">
      <div className="flex-between mb-4">
        <h2>Users</h2>
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
                  onClick={() => handleOpenModal(user)}
                  style={{ width: '100%' }}
                 >
                   Set Users Assets and Location
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedUser.name} - Details</h2>
              <button className="close-modal" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              {modalStep === 1 ? (
                /* Step 1: Location Selection */
                <>
                  <div className="modal-details mb-4">
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    <p><strong>Department:</strong> {selectedUser.department || "N/A"}</p>
                  </div>

                  <div className="form-group mb-6">
                    <label className="form-label">Set Location First</label>
                    <select 
                      className="form-input"
                      style={locationError ? { border: '1px solid red' } : {}}
                      value={assignForm.location_id}
                      onChange={(e) => {
                        setAssignForm({ ...assignForm, location_id: e.target.value });
                        if (e.target.value) setLocationError(false);
                      }}
                    >
                      <option value="">Select Location</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    {locationError && (
                      <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                        Select Location
                      </p>
                    )}
                  </div>

                  <div className="modal-footer flex gap-4">
                    <button 
                      className="btn btn-secondary flex-1" 
                      onClick={handleCancelAssignment}
                      disabled={modalLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary flex-1" 
                      onClick={fetchAssetsForStep2}
                      disabled={modalLoading}
                    >
                      {modalLoading ? "Saving..." : "Next: Select Assets"}
                    </button>
                  </div>
                </>
              ) : (
                /* Step 2: Asset Assignment */
                <>
                  <div className="mb-4">
                    <h4 className="mb-2">Step 2: Assign Available Assets</h4>
                    <p className="text-secondary text-sm mb-4">
                      Showing available assets at: <strong>{locations.find(l => String(l.id) === String(assignForm.location_id))?.name}</strong>
                    </p>
                    
                    <div className="asset-checkbox-list" style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
                      {availableAssets.length === 0 ? (
                        <p className="text-center py-4 text-secondary">No available assets at this location.</p>
                      ) : (
                        availableAssets.map(asset => (
                          <label key={asset.id} className="asset-checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                            <input 
                              type="checkbox" 
                              checked={assignForm.asset_ids.includes(asset.id)}
                              onChange={() => toggleAssetSelection(asset.id)}
                              style={{ width: '18px', height: '18px' }}
                            />
                            <div>
                              <div className="font-bold">{asset.name}</div>
                              <div className="text-sm text-secondary">{asset.serial_number}</div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  {selectedUser.assigned_assets.length > 0 && (
                    <div className="mt-6">
                      <h4 className="mb-2 text-secondary">Currently Assigned Assets</h4>
                      <div className="assigned-assets-list">
                        {selectedUser.assigned_assets.map(asset => (
                          <div key={asset.id} className="assigned-asset-item">
                            <span className="text-sm">{asset.name}</span>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleUnassignAsset(asset.id)}
                            >
                              Unassign
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="modal-footer mt-8 flex gap-4">
                    <button 
                      className="btn btn-secondary flex-1" 
                      onClick={() => {
                        setModalStep(1);
                        setAssignForm(prev => ({ ...prev, asset_ids: [] }));
                      }}
                      disabled={modalLoading}
                    >
                      Back
                    </button>
                    <button 
                      className="btn btn-primary flex-1" 
                      onClick={handleSaveAssignment}
                      disabled={modalLoading || (assignForm.asset_ids.length === 0 && String(assignForm.location_id) === String(selectedUser.loc_id))}
                    >
                      {modalLoading ? "Saving..." : `Save Changes ${assignForm.asset_ids.length > 0 ? `(${assignForm.asset_ids.length})` : ''}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
