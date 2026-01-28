"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"
import { formatDate } from "../utils/dateUtils"

const Requests = () => {
  const { user } = useAuth()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRequest) {
        await api.put(`/requests/${editingRequest.id}`, formData)
      } else {
        await api.post("/requests", formData)
      }
      setShowModal(false)
      setEditingRequest(null)
      resetForm()
      fetchRequests()
    } catch (error) {
      console.error("Error saving request:", error)
    }
  }

  const handleStatusUpdate = async (requestId, status, response = "") => {
    try {
      await api.put(`/requests/${requestId}/status`, { status, response })
      fetchRequests()
    } catch (error) {
      console.error("Error updating request status:", error)
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await api.delete(`/requests/${id}`)
        fetchRequests()
      } catch (error) {
        console.error("Error deleting request:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      asset_id: "",
      request_type: "Repair",
      reason: "",
      description: "",
      priority: "Medium",
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

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>
          {user?.role === "Employee"
            ? "My Requests"
            : user?.role === "IT Supervisor"
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
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
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
                <td>{formatDate(request.created_at)}</td>
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
                        <button onClick={() => handleDelete(request.id)} className="btn btn-danger">
                          Delete
                        </button>
                      </>
                    )}
                    {(user?.role === "IT Supervisor" || user?.role === "Super Admin") && (
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
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingRequest ? "Edit Request" : "Create New Request"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false)
                  setEditingRequest(null)
                  resetForm()
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Asset (Optional)</label>
                <select name="asset_id" className="form-select" value={formData.asset_id} onChange={handleChange}>
                  <option value="">Select Asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.serial_number}
                    </option>
                  ))}
                </select>
              </div>
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
                <button type="submit" className="btn btn-primary">
                  {editingRequest ? "Update Request" : "Submit Request"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
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
      )}
    </div>
  )
}

export default Requests
