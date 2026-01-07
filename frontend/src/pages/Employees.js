"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"

const Employees = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
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
      setLoading(false)
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
        fetchEmployees()
        fetchAssets()
      } catch (error) {
        console.error("Error unassigning asset:", error)
      }
    }
  }

  const openAssignModal = (employee) => {
    setSelectedEmployee(employee)
    setShowAssignModal(true)
  }

  const handleAssignmentChange = (e) => {
    setAssignmentData({ ...assignmentData, [e.target.name]: e.target.value })
  }

  const getAvailableAssets = () => {
    return assets.filter((asset) => asset.status === "Available")
  }

  if (loading) {
    return <div className="loading">Loading employees...</div>
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
        <div className="employee-grid">
          {employees.map((employee) => (
            <div key={employee.id} className="card">
              <div className="employee-header">
                <h3>{employee.name}</h3>
                <span className="employee-role">{employee.role}</span>
              </div>
              <div className="employee-info">
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

              {employee.assigned_assets && employee.assigned_assets.length > 0 && (
                <div className="assigned-assets">
                  <h4>Assigned Assets:</h4>
                  <ul>
                    {employee.assigned_assets.map((asset) => (
                      <li key={asset.id} className="asset-item">
                        <span>
                          {asset.name} - {asset.serial_number}
                        </span>
                        {(user?.role === "Super Admin" || user?.role === "IT Supervisor") && (
                          <button
                            onClick={() => handleUnassignAsset(employee.id, asset.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Unassign
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(user?.role === "Super Admin" || user?.role === "IT Supervisor") && (
                <div className="employee-actions">
                  <button onClick={() => openAssignModal(employee)} className="btn btn-primary">
                    Assign Asset
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Assign Asset to {selectedEmployee?.name}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedEmployee(null)
                  setAssignmentData({ asset_id: "", notes: "" })
                }}
              >
              </button>
            </div>
            <form onSubmit={handleAssignAsset}>
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
                      {asset.name} - {asset.serial_number} ({asset.asset_type})
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
                <button type="submit" className="btn btn-primary">
                  Assign Asset
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
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
      )}

      <style>{`
        .employee-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .employee-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }

        .employee-role {
          background: #007bff;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .employee-info p {
          margin-bottom: 8px;
        }

        .assigned-assets {
          margin-top: 15px;
        }

        .assigned-assets h4 {
          margin-bottom: 10px;
          font-size: 14px;
          color: #666;
        }

        .assigned-assets ul {
          list-style: none;
          padding: 0;
        }

        .asset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
          margin-bottom: 5px;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }

        .employee-actions {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  )
}

export default Employees
