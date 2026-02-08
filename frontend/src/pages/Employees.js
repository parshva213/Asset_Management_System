"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"

const Employees = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [assets, setAssets] = useState([])
  // Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsEmployee, setDetailsEmployee] = useState(null)

  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [assignmentData, setAssignmentData] = useState({
    asset_id: "",
    notes: "",
  })

  useEffect(() => {
    fetchEmployees()
    fetchAssets()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/users")
      setEmployees(response.data)
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      // setLoading(false)
    }
  }

  const fetchAssets = async () => {
    try {
      const response = await api.get("/assets")
      setAssets(response.data)
    } catch (error) {
      console.error("Error fetching assets:", error)
    }
  }

  const openDetailsModal = (employee) => {
    setDetailsEmployee(employee)
    setShowDetailsModal(true)
  }

  const openAssignModal = (employee) => {
    setSelectedEmployee(employee)
    setShowAssignModal(true)
  }

  const handleAssignAsset = async (e) => {
    e.preventDefault()
    try {
      await api.post("/users/assign-asset", {
        user_id: selectedEmployee.id,
        asset_id: assignmentData.asset_id,
        notes: assignmentData.notes,
      })
      setShowAssignModal(false)
      setSelectedEmployee(null)
      setAssignmentData({ asset_id: "", notes: "" })
      fetchEmployees()
      fetchAssets()
    } catch (error) {
      console.error("Error assigning asset:", error)
    }
  }

  const handleUnassignAsset = async (userId, assetId) => {
    if (window.confirm("Are you sure you want to unassign this asset?")) {
      try {
        await api.post("/users/unassign-asset", {
          user_id: userId,
          asset_id: assetId,
        })

        // If unassigning from details modal, update the local details view too
        if (detailsEmployee && detailsEmployee.id === userId) {
          const updatedAssets = detailsEmployee.assigned_assets.filter(a => a.id !== assetId);
          setDetailsEmployee({ ...detailsEmployee, assigned_assets: updatedAssets });
        }

        fetchEmployees()
        fetchAssets()
      } catch (error) {
        console.error("Error unassigning asset:", error)
      }
    }
  }

  const handleAssignmentChange = (e) => {
    setAssignmentData({ ...assignmentData, [e.target.name]: e.target.value })
  }

  const getAvailableAssets = () => {
    return assets.filter((asset) => asset.status === "Available")
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>User Management</h2>
      </div>

      {employees.length === 0 ? (
        <div className="empty-state">
          <p>No employees found</p>
        </div>
      ) : (
        <div className="user-grid">
          {employees.map((employee) => (
            <div key={employee.id} className="user-card" id={`user-${employee.id}`}>
              <div className="card-header">
                <h3>{employee.name}</h3>
                <span className="badge badge-low">{employee.role}</span>
              </div>
              <div className="card-body">
                <p>
                  <strong>Email:</strong> {employee.email}
                </p>
                <p>
                  <strong>Department:</strong> {employee.department || "N/A"}
                </p>
                <p>
                  <strong>Assigned Assets:</strong> {employee.assigned_assets?.length || 0}
                </p>
              </div>

              <div className="card-footer">
                <button onClick={() => openDetailsModal(employee)} className="btn btn-secondary">
                  View Details
                </button>
                {(user?.role === "Super Admin" || user?.role === "Supervisor") && (
                  <button onClick={() => openAssignModal(employee)} className="btn btn-primary">
                    Assign Asset
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailsEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{detailsEmployee.name} - Details</h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowDetailsModal(false)
                  setDetailsEmployee(null)
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-details mb-4">
                <p><strong>Email:</strong> {detailsEmployee.email}</p>
                <p><strong>Role:</strong> {detailsEmployee.role}</p>
                <p><strong>Department:</strong> {detailsEmployee.department || "N/A"}</p>
              </div>

              <h4>Assigned Assets ({detailsEmployee.assigned_assets?.length || 0})</h4>
              {detailsEmployee.assigned_assets && detailsEmployee.assigned_assets.length > 0 ? (
                <div className="assigned-assets-list mb-6">
                  {detailsEmployee.assigned_assets.map((asset) => (
                    <div key={asset.id} className="assigned-asset-item">
                      <span>
                        {asset.name} - SN: {asset.serial_number || "N/A"}
                      </span>
                      {(user?.role === "Super Admin" || user?.role === "Supervisor") && (
                        <button
                          onClick={() => {
                            handleUnassignAsset(detailsEmployee.id, asset.id);
                            setShowDetailsModal(false);
                          }}
                          className="btn btn-danger btn-sm"
                        >
                          Unassign
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-6">No assets assigned.</p>
              )}
              
              <div className="flex justify-end">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign Asset to {selectedEmployee?.name}</h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedEmployee(null)
                  setAssignmentData({ asset_id: "", notes: "" })
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
                <form onSubmit={handleAssignAsset} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div className="form-group">
                    <label className="form-label">Select Asset</label>
                    <select
                    name="asset_id"
                    className="form-select"
                    value={assignmentData.asset_id}
                    onChange={handleAssignmentChange}
                    required
                    >
                    <option value="">Choose an asset</option>
                    {getAvailableAssets().map((asset) => (
                        <option key={asset.id} value={asset.id}>
                        {asset.name} - Qty: {asset.quantity || "N/A"} ({asset.asset_type})
                        </option>
                    ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Notes (Optional)</label>
                    <textarea
                    name="notes"
                    className="form-input"
                    value={assignmentData.notes}
                    onChange={handleAssignmentChange}
                    rows="3"
                    placeholder="Any additional notes about this assignment"
                    />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                    Assign Asset
                    </button>
                    <button
                    type="button"
                    className="btn btn-secondary"
                    style={{flex: 1}}
                    onClick={() => {
                        setShowAssignModal(false)
                        setSelectedEmployee(null)
                        setAssignmentData({ asset_id: "", notes: "" })
                    }}
                    >
                    Cancel
                    </button>
                </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
