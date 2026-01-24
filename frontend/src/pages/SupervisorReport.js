"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../api"
import { useToast } from "../contexts/ToastContext"

const SupervisorReport = () => {
  const { showError, showSuccess } = useToast()
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeDetails, setEmployeeDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [availableAssets, setAvailableAssets] = useState([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetAssignmentModal, setAssetAssignmentModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [assigning, setAssigning] = useState(false)

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get("/reports/supervisor/my-employees")
      setEmployees(response.data)
    } catch (error) {
      console.error("Error fetching employees:", error)
      showError("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }, [showError])

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      setDetailsLoading(true)
      const response = await api.get(`/reports/supervisor/employee/${employeeId}/details`)
      setSelectedEmployee(employeeId)
      setEmployeeDetails(response.data)
    } catch (error) {
      console.error("Error fetching employee details:", error)
      showError("Failed to load employee details")
      setSelectedEmployee(null)
      setEmployeeDetails(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  const fetchAvailableAssets = async () => {
    try {
      setAssetsLoading(true)
      const response = await api.get("/reports/available-assets")
      setAvailableAssets(response.data)
    } catch (error) {
      console.error("Error fetching available assets:", error)
      showError("Failed to load available assets")
    } finally {
      setAssetsLoading(false)
    }
  }

  const handleAssignAsset = async (e) => {
    e.preventDefault()

    if (!selectedAsset) {
      showError("Please select an asset")
      return
    }

    try {
      setAssigning(true)
      await api.post("/reports/assign-asset", {
        asset_id: selectedAsset.id,
        employee_id: selectedEmployee
      })

      showSuccess("Asset assigned successfully!")
      setAssetAssignmentModal(false)
      setSelectedAsset(null)
      await fetchEmployeeDetails(selectedEmployee)
      await fetchAvailableAssets()
    } catch (error) {
      const message = error.response?.data?.message || "Failed to assign asset"
      showError(message)
    } finally {
      setAssigning(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    if (assetAssignmentModal) {
      fetchAvailableAssets()
    }
  }, [assetAssignmentModal])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 Employee Report</h1>
        <p className="page-subtitle">View and manage all employees under your supervision</p>
      </div>

      {/* Stats */}
      <div className="stats-grid-2">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#3b82f6" }}>👥</div>
          <div className="stat-content">
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{employees.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ec4899" }}>📦</div>
          <div className="stat-content">
            <div className="stat-label">Total Assets</div>
            <div className="stat-value">{employees.reduce((sum, emp) => sum + (emp.total_assets || 0), 0)}</div>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Left Panel - Employees List */}
        <div className="employees-panel">
          <div className="panel-header">
            <h2>My Employees</h2>
            <input
              type="text"
              placeholder="🔍 Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="employees-list">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`employee-card ${selectedEmployee === employee.id ? "active" : ""}`}
                  onClick={() => fetchEmployeeDetails(employee.id)}
                >
                  <div className="employee-avatar">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-info">
                    <h4>{employee.name}</h4>
                    <p className="email">{employee.email}</p>
                    <p className="location">📍 {employee.location_name || "No location"}</p>
                    <span className="asset-count">
                      📦 {employee.total_assets || 0} assets
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No employees found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Employee Details */}
        <div className="details-panel">
          {selectedEmployee && employeeDetails ? (
            <>
              {detailsLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : (
                <>
                  {/* Employee Header */}
                  <div className="details-header">
                    <div>
                      <h2>{employeeDetails.employee.name}</h2>
                      <p className="subtitle">{employeeDetails.employee.email}</p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="section">
                    <h3>Personal Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Email</span>
                        <span className="value">{employeeDetails.employee.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Phone</span>
                        <span className="value">{employeeDetails.employee.phone || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Department</span>
                        <span className="value">{employeeDetails.employee.department || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Role</span>
                        <span className="value">{employeeDetails.employee.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Room */}
                  <div className="section">
                    <h3>Location & Room Assignment</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Location</span>
                        <span className="value">{employeeDetails.employee.location_name || "Not assigned"}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Room</span>
                        <span className="value">{employeeDetails.employee.room_name || "Not assigned"}</span>
                      </div>
                      {employeeDetails.employee.floor && (
                        <div className="info-item">
                          <span className="label">Floor</span>
                          <span className="value">Floor {employeeDetails.employee.floor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assets */}
                  <div className="section">
                    <div className="section-header">
                      <h3>Assigned Assets ({employeeDetails.assets?.length || 0})</h3>
                      <button
                        className="btn-assign"
                        onClick={() => {
                          setAssetAssignmentModal(true)
                          setSelectedAsset(null)
                        }}
                      >
                        + Assign Asset
                      </button>
                    </div>

                    {employeeDetails.assets && employeeDetails.assets.length > 0 ? (
                      <div className="assets-list">
                        {employeeDetails.assets.map((asset) => (
                          <div key={asset.id} className="asset-item">
                            <div className="asset-header">
                              <h4>{asset.name}</h4>
                              <span className={`badge badge-${asset.status.toLowerCase()}`}>
                                {asset.status}
                              </span>
                            </div>
                            <div className="asset-details">
                              <p><strong>Serial:</strong> {asset.serial_number}</p>
                              <p><strong>Category:</strong> {asset.category_name || "N/A"}</p>
                              <p><strong>Location:</strong> {asset.location_name || "N/A"}</p>
                              {asset.room_name && <p><strong>Room:</strong> {asset.room_name}</p>}
                              {asset.description && <p><strong>Details:</strong> {asset.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-assets">
                        <p>No assets assigned yet</p>
                        <button
                          className="btn-primary"
                          onClick={() => {
                            setAssetAssignmentModal(true)
                            setSelectedAsset(null)
                          }}
                        >
                          Assign First Asset
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>👇 Select an employee to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Asset Assignment Modal */}
      {assetAssignmentModal && (
        <div className="modal-overlay" onClick={() => setAssetAssignmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Asset to {employeeDetails?.employee.name}</h2>
              <button
                className="modal-close"
                onClick={() => setAssetAssignmentModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignAsset}>
              <div className="form-group">
                <label>Select Asset</label>
                {assetsLoading ? (
                  <p style={{ color: "var(--text-muted)" }}>Loading assets...</p>
                ) : availableAssets.length > 0 ? (
                  <div className="asset-options">
                    {availableAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className={`asset-option ${selectedAsset?.id === asset.id ? "selected" : ""}`}
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <div className="option-header">
                          <h4>{asset.name}</h4>
                          <span className={`badge badge-${asset.status.toLowerCase()}`}>
                            {asset.status}
                          </span>
                        </div>
                        <p className="option-details">
                          Serial: {asset.serial_number || "N/A"} | Category: {asset.category_name || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)" }}>No available assets to assign</p>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setAssetAssignmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!selectedAsset || assigning || availableAssets.length === 0}
                >
                  {assigning ? "Assigning..." : "Assign Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container {
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .stats-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--primary-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .content-wrapper {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
          height: calc(100vh - 350px);
        }

        .employees-panel,
        .details-panel {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-header h2 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.95rem;
          color: var(--text-primary);
          background: var(--bg-primary);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .employees-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .employee-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 0.5rem;
          border: 2px solid transparent;
        }

        .employee-card:hover {
          background: var(--bg-secondary);
        }

        .employee-card.active {
          border-color: var(--primary-color);
          background: rgba(59, 130, 246, 0.1);
        }

        .employee-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .employee-info {
          flex: 1;
          min-width: 0;
        }

        .employee-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .employee-info .email {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0 0 0.25rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .employee-info .location {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0 0 0.25rem 0;
        }

        .asset-count {
          display: inline-block;
          font-size: 0.75rem;
          background: var(--bg-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: var(--text-primary);
        }

        .no-results {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-muted);
        }

        .details-panel {
          overflow-y: auto;
          padding: 2rem;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .details-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .details-header .subtitle {
          color: var(--text-muted);
          margin: 0.25rem 0 0 0;
        }

        .section {
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .section-header h3 {
          margin: 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .info-item .value {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .assets-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .asset-item {
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
        }

        .asset-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .asset-header h4 {
          margin: 0;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .asset-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .asset-details p {
          margin: 0;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-assigned {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-available {
          background: #dbeafe;
          color: #0c4a6e;
        }

        .badge-maintenance {
          background: #fef3c7;
          color: #92400e;
        }

        .no-assets {
          text-align: center;
          padding: 2rem 1rem;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .no-assets p {
          color: var(--text-muted);
          margin: 0 0 1rem 0;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .btn-assign {
          padding: 0.5rem 1rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-assign:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          opacity: 0.8;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 8px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-muted);
        }

        .modal-close:hover {
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .asset-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .asset-option {
          padding: 1rem;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .asset-option:hover {
          border-color: var(--primary-color);
          background: var(--bg-secondary);
        }

        .asset-option.selected {
          border-color: var(--primary-color);
          background: rgba(59, 130, 246, 0.1);
        }

        .option-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .option-header h4 {
          margin: 0;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .option-details {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .content-wrapper {
            grid-template-columns: 1fr;
            height: auto;
          }

          .details-panel {
            min-height: 400px;
          }
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .stats-grid-2 {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  )
}

export default SupervisorReport
