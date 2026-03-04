"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import api from "../api"

const UserRequests = () => {
  const { user } = useAuth()
  const { userId } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  
  const [requests, setRequests] = useState([])
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
  })

  const fetchUserData = useCallback(async () => {
    try {
      const response = await api.get(`/users/${userId}`)
      setUserData(response.data)
    } catch (error) {
      console.error("Error fetching user data:", error)
      showError("User not found")
    }
  }, [userId, showError])

  const fetchUserRequests = useCallback(async () => {
    try {
      const response = await api.get("/requests")
      // Filter requests by requested_by user
      const userRequests = response.data.filter(req => req.requested_by === parseInt(userId))
      setRequests(userRequests)
    } catch (error) {
      console.error("Error fetching requests:", error)
      showError("Error fetching requests")
    } finally {
      setLoading(false)
    }
  }, [userId, showError])

  useEffect(() => {
    // Only supervisors and super admins can view other users' requests
    if (user?.role !== "Supervisor" && user?.role !== "Super Admin") {
      navigate("/requests")
      return
    }
    
    fetchUserData()
    fetchUserRequests()
  }, [userId, user, navigate, fetchUserData, fetchUserRequests])

  const handleStatusUpdate = async (requestId, status, response = "") => {
    try {
      await api.put(`/requests/${requestId}/status`, { status, response })
      fetchUserRequests()
      showSuccess(`Request status updated to ${status}`)
    } catch (error) {
      console.error("Error updating request status:", error)
      showError("Error updating request status")
    }
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

  const getAssetDisplay = (request) => {
    // For existing assets, show the asset name
    if (request.asset_name) {
      return request.asset_name
    }

    // For new asset requests, extract model name from description
    if (request.request_type === "New Asset" && request.description) {
      const modelMatch = request.description.match(/Model:\s*(.+?)(?:\n|$)/)
      if (modelMatch && modelMatch[1]) {
        return modelMatch[1].trim()
      }
      return "New Asset Request"
    }

    return "N/A"
  }

  if (loading) {
    return <div className="loading">Loading requests...</div>
  }

  if (!userData) {
    return (
      <div className="content">
        <div className="flex-center h-full">
          <div className="empty-state">
            <h3>User not found</h3>
            <p className="text-secondary">The requested user does not exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="page-title">Requests from {userData.name}</h2>
          <p className="text-secondary">{userData.email} • {userData.department || "N/A"}</p>
        </div>
        <button onClick={() => navigate("/requests")} className="btn btn-secondary">
          ← Back to All Requests
        </button>
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
                <th>Status</th>
                <th>Created</th>
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
                  <td>{getAssetDisplay(request)}</td>
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
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
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
                              onClick={() => {
                                const response = prompt("Completion response:")
                                if (response !== null) handleStatusUpdate(request.id, "Completed", response)
                              }}
                              className="btn btn-success"
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
    </div>
  )
}

export default UserRequests
