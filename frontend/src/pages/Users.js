"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"
import { formatDate } from "../utils/dateUtils"

const Users = () => {
  useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [locationName, setLocationName] = useState("")
  const [loading, setLoading] = useState(true)

  const locationId = searchParams.get("location_id")
  const role = searchParams.get("role")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/users?${searchParams.toString()}`
      const response = await api.get(url)
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const fetchLocationName = useCallback(async () => {
    try {
      const response = await api.get(`/locations/${locationId}`)
      setLocationName(response.data.name)
    } catch (error) {
      console.error("Error fetching location name:", error)
    }
  }, [locationId])

  useEffect(() => {
    fetchUsers()
    if (locationId) {
      fetchLocationName()
    }
  }, [locationId, role, fetchUsers, fetchLocationName])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  const title = role 
    ? `${role.charAt(0).toUpperCase() + role.slice(1)} Team` 
    : "Users"

  return (
    <div className="content">
      <div className="flex-between mb-4">
        <div>
          <button 
            onClick={() => navigate("/locations")} 
            className="btn btn-secondary mb-2"
            style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}
          >
            ← Back to Locations
          </button>
          <h2>{title} {locationName && ` - ${locationName}`}</h2>
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
              <div className="card-header border-b pb-2 mb-3 flex-between">
                <div>
                  <h3 className="text-lg font-bold">{user.name}</h3>
                </div>
                <span className="badge badge-primary">{user.role}</span>
              </div>
              <div className="card-body">
                <p className="mb-2"><strong>Email:</strong> {user.email}</p>
                <p className="mb-2"><strong>Phone:</strong> {user.phone || "N/A"}</p>
                <p className="mb-2"><strong>Department:</strong> {user.department || "N/A"}</p>
                <p className="mb-2"><strong>Joined:</strong> {formatDate(user.created_at)}</p>
              </div>
              <div className="card-footer mt-3 pt-3 border-t">
                 <span className="text-sm text-secondary">
                   Assigned Assets: {user.assigned_assets?.length || 0}
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Users
