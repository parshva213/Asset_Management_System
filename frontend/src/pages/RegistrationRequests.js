"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import { formatDate } from "../utils/dateUtils"

const RegistrationRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    role: "",
  })

  useEffect(() => {
    if (user?.role === "Super Admin") {
      fetchRegistrationRequests()
    }
  }, [user])

  const fetchRegistrationRequests = async () => {
    try {
      setRequests([])
    } catch (error) {
      console.error("Error fetching registration requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`/api/auth/registration-requests/${requestId}/approve`)
      fetchRegistrationRequests()
    } catch (error) {
      console.error("Error approving request:", error)
    }
  }

  const handleReject = async (requestId) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (reason) {
      try {
        await axios.put(`/api/auth/registration-requests/${requestId}/reject`, {
          rejection_reason: reason,
        })
        fetchRegistrationRequests()
      } catch (error) {
        console.error("Error rejecting request:", error)
      }
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const filteredRequests = requests.filter((request) => {
    return (
      (filters.status === "" || request.status === filters.status) &&
      (filters.role === "" || request.role === filters.role)
    )
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ffc107"
      case "Approved":
        return "#28a745"
      case "Rejected":
        return "#dc3545"
      default:
        return "#6c757d"
    }
  }

  if (user?.role !== "Super Admin") {
    return (
      <div className="empty-state">
        <p>Access denied. Only Super Admins can view registration requests.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading registration requests...</div>
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Registration Requests</h2>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Role</label>
          <select name="role" className="form-select" value={filters.role} onChange={handleFilterChange}>
            <option value="">All Roles</option>
            <option value="IT Supervisor">IT Supervisor</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>No registration requests found</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.name}</td>
                <td>{request.email}</td>
                <td>{request.role}</td>
                <td>{request.department || "N/A"}</td>
                <td>{request.phone || "N/A"}</td>
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
                <td>{formatDate(request.requested_at)}</td>
                <td>
                  {request.status === "Pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(request.id)} className="btn btn-primary">
                        Approve
                      </button>
                      <button onClick={() => handleReject(request.id)} className="btn btn-danger">
                        Reject
                      </button>
                    </div>
                  )}
                  {request.status === "Rejected" && request.rejection_reason && (
                    <div>
                      <small style={{ color: "#dc3545" }}>Reason: {request.rejection_reason}</small>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default RegistrationRequests
