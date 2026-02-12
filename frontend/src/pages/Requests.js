"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import api from "../api"

const Requests = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [requests, setRequests] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
  })
  const [categories, setCategories] = useState([])
  const [uniqueAssets, setUniqueAssets] = useState([])
  const [newAssetSelection, setNewAssetSelection] = useState({
    category_id: "",
    asset_type: "",
    model_name: ""
  })
  const [formData, setFormData] = useState({
    asset_id: "",
    request_type: "Repair",
    reason: "",
    description: "",
    priority: "Medium",
  })

  useEffect(() => {
    fetchRequests()
    fetchAssets()
    fetchCategories()
    fetchUniqueAssets()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get("/requests")
      setRequests(response.data)
    } catch (error) {
      console.error("Error fetching requests:", error)
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

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchUniqueAssets = async () => {
    try {
      const response = await api.get("/assets/unique-names")
      setUniqueAssets(response.data)
    } catch (error) {
      console.error("Error fetching unique assets:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRequest) {
        await api.put(`/requests/${editingRequest.id}`, formData)
        showSuccess("Request updated successfully")
      } else {
        // Prepare payload
        let payload = { ...formData }

        if (formData.request_type === "New Asset") {
          // For new assets, we don't have a specific asset_id. 
          // We'll bundle the selection details into the description.
          const catName = categories.find(c => c.id === Number(newAssetSelection.category_id))?.name || "Unknown Category";

          const detailedDesc = `[New Asset Request]
Category: ${catName}
Type: ${newAssetSelection.asset_type}
Model: ${newAssetSelection.model_name}

Description: ${formData.description}`;

          payload.description = detailedDesc;
          payload.asset_id = null; // Explicitly null
        }

        await api.post("/requests", payload)
        showSuccess("Request submitted successfully")
      }
      setShowModal(false)
      setEditingRequest(null)
      resetForm()
      fetchRequests()
    } catch (error) {
      console.error("Error saving request:", error)
      showError("Error saving request")
    }
  }

  const handleStatusUpdate = async (requestId, status, response = "") => {
    try {
      await api.put(`/requests/${requestId}/status`, { status, response })
      fetchRequests()
      showSuccess(`Request status updated to ${status}`)
    } catch (error) {
      console.error("Error updating request status:", error)
      showError("Error updating request status")
    }
  }

  const handleEdit = (request) => {
    setEditingRequest(request)
    setFormData({
      asset_id: request.asset_id || "",
      request_type: request.request_type,
      reason: request.reason || "",
      description: request.description || "",
      priority: request.priority,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      asset_id: "",
      request_type: "Repair",
      reason: "",
      description: "",
      priority: "Medium",
    })
    setNewAssetSelection({
      category_id: "",
      asset_type: "",
      model_name: ""
    })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const filteredRequests = requests.filter((request) => {
    return (
      (filters.status === "" || request.status === filters.status) &&
      (filters.priority === "" || request.priority === filters.priority) &&
      (filters.type === "" || request.request_type === filters.type)
    )
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ffc107"
      case "In Progress":
        return "#17a2b8"
      case "Approved":
        return "#28a745"
      case "Rejected":
        return "#dc3545"
      case "Completed":
        return "#6f42c1"
      default:
        return "#6c757d"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "#28a745"
      case "Medium":
        return "#ffc107"
      case "High":
        return "#fd7e14"
      case "Critical":
        return "#dc3545"
      default:
        return "#6c757d"
    }
  }

  if (loading) {
    return <div className="loading">Loading requests...</div>
  }

  if ((user?.role === "Supervisor" || user?.role === "Employee") && !user?.room_id) {
    return (
      <div className="content">
        <div className="flex-center h-full">
          <div className="empty-state">
            <h3>Set your location first</h3>
            <p className="text-secondary">You need to be assigned to a room to view requests.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>
          {user?.role === "Employee"
            ? "My Requests"
            : user?.role === "Supervisor"
              ? "Request Management"
              : "All Requests"}
        </h2>
        {user?.role === "Employee" && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingRequest(null)
              resetForm()
              setShowModal(true)
            }}
          >
            + New Request
          </button>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="form-label">Priority</label>
          <select name="priority" className="form-select" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Type</label>
          <select name="type" className="form-select" value={filters.type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="Repair">Repair</option>
            <option value="Replacement">Replacement</option>
            <option value="New Asset">New Asset</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>No requests found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Type</th>
                <th>Asset</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} id={`req-${request.id}`}>
                  <td>
                    <span
                      style={{
                        color: getPriorityColor(request.priority),
                        fontWeight: "bold",
                      }}
                    >
                      {request.priority}
                    </span>
                  </td>
                  <td>{request.request_type}</td>
                  <td>{request.asset_name || "N/A"}</td>
                  <td>{request.requester_name || "N/A"}</td>
                  <td>
                    <span
                      style={{
                        color: getStatusColor(request.status),
                        fontWeight: "bold",
                      }}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {user?.role === "Employee" && request.status === "Pending" && (
                        <>
                          <button onClick={() => handleEdit(request)} className="btn btn-secondary">
                            Edit
                          </button>
                        </>
                      )}
                      {(user?.role === "Supervisor" || user?.role === "Super Admin") && (
                        <>
                          {request.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(request.id, "In Progress")}
                                className="btn btn-secondary"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  const response = prompt("Rejection reason:")
                                  if (response) handleStatusUpdate(request.id, "Rejected", response)
                                }}
                                className="btn btn-danger"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {request.status === "In Progress" && (
                            <button
                              onClick={() => handleStatusUpdate(request.id, "Completed")}
                              className="btn btn-primary"
                            >
                              Complete
                            </button>
                          )}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRequest ? "Edit Request" : "Create New Request"}</h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowModal(false)
                  setEditingRequest(null)
                  resetForm()
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Request Type</label>
                  <select
                    name="request_type"
                    className="form-select"
                    value={formData.request_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Repair">Repair</option>
                    <option value="Replacement">Replacement</option>
                    <option value="New Asset">New Asset</option>
                  </select>
                </div>

                {formData.request_type !== "New Asset" ? (
                  <div className="form-group">
                    <label className="form-label">Your Asset (Optional)</label>
                    <select name="asset_id" className="form-select" value={formData.asset_id} onChange={handleChange}>
                      <option value="">Select Your Assign Asset</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} - {asset.serial_number}
                        </option>
                      ))}
                    </select>
                    <small className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Showing only assets assigned to you.
                    </small>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={newAssetSelection.category_id}
                        onChange={(e) => setNewAssetSelection({ ...newAssetSelection, category_id: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {newAssetSelection.category_id && (
                      <div className="form-group">
                        <label className="form-label">Asset Type</label>
                        <select
                          className="form-select"
                          value={newAssetSelection.asset_type}
                          onChange={(e) => setNewAssetSelection({ ...newAssetSelection, asset_type: e.target.value })}
                        >
                          <option value="">Select Type</option>
                          <option value="Hardware">Hardware</option>
                          <option value="Software">Software</option>
                        </select>
                      </div>
                    )}

                    {newAssetSelection.asset_type && (
                      <div className="form-group">
                        <label className="form-label">Model</label>
                        <select
                          className="form-select"
                          value={newAssetSelection.model_name}
                          onChange={(e) => setNewAssetSelection({ ...newAssetSelection, model_name: e.target.value })}
                        >
                          <option value="">Select Model</option>
                          {uniqueAssets
                            .filter(a => a.category_id === Number(newAssetSelection.category_id) && a.asset_type === newAssetSelection.asset_type)
                            .map(a => (
                              <option key={a.id} value={a.name}>{a.name}</option>
                            ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <input
                    type="text"
                    name="reason"
                    className="form-input"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Brief reason for the request"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-input"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Detailed description of the request"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingRequest ? "Update Request" : "Submit Request"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowModal(false)
                      setEditingRequest(null)
                      resetForm()
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

export default Requests
