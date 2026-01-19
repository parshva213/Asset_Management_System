import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import api from "../api"

const Users = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState("")

  const locationId = searchParams.get("location_id")
  const role = searchParams.get("role")

  useEffect(() => {
    fetchUsers()
    if (locationId) {
      fetchLocationName()
    }
  }, [locationId, role])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (locationId) params.location_id = locationId
      if (role) params.role = role

      const response = await api.get("/users", { params })
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLocationName = async () => {
    try {
      const response = await api.get(`/locations/${locationId}`)
      setLocationName(response.data.name)
    } catch (error) {
      console.error("Error fetching location:", error)
    }
  }

  const getPageTitle = () => {
    const parts = []
    if (role) {
      parts.push(role.charAt(0).toUpperCase() + role.slice(1))
    }
    if (locationName) {
      parts.push(`at ${locationName}`)
    }
    return parts.length > 0 ? parts.join(" ") : "Users"
  }

  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>{getPageTitle()}</h2>
        <button onClick={() => navigate("/locations")} className="btn btn-secondary">
          ← Back to Locations
        </button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="user-header">
                <h3>{user.name}</h3>
                <span className="user-role-badge">{user.role}</span>
              </div>
              <div className="user-info">
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                {user.department && (
                  <p>
                    <strong>Department:</strong> {user.department}
                  </p>
                )}
                {user.phone && (
                  <p>
                    <strong>Phone:</strong> {user.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .user-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .user-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--text-primary);
        }

        .user-role-badge {
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .user-info p {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .user-info strong {
          color: var(--text-secondary);
          margin-right: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default Users
