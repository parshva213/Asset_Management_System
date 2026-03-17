"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import api from "../api"

// Module-level: stable reference, no re-creation on render
const FilterSH = ({ category, selected, label, onClear, listLength }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
    {selected.length > 0 && listLength > 1 && (
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }} title="Clear this filter">
        <input
          type="checkbox"
          checked
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#dc3545' }}
          onChange={() => onClear(category)}
        />
      </label>
    )}
    <span style={{ color: '#b0b0b0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{label}</span>
  </div>
)

const Requests = () => {
  const { user } = useAuth()
  const role = user?.role?.toLowerCase() || ""
  const { showSuccess, showError } = useToast()
  const [requests, setRequests] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    type: [],
    requester: [],
    location: [],
    room: [],
    supervisor: [],
  })
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [categories, setCategories] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [uniqueAssets, setUniqueAssets] = useState([])
  const [newAssetSelection, setNewAssetSelection] = useState({
    category_id: "",
    asset_type: "",
    model_name: "",
    otherBrand: "",
    otherModel: ""
  })
  const [formData, setFormData] = useState({
    asset_id: "",
    request_type: "",
    reason: "", 
    description: "",
    priority: "",
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
      const locId = role !== "super admin" ? user?.loc_id : null;
      const response = await api.get(`/categories${locId ? `?location_id=${locId}` : ""}`)
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchUniqueAssets = async () => {
    try {
      const locId = role !== "super admin" ? user?.loc_id : null;
      const response = await api.get(`/assets/unique-names${locId ? `?location_id=${locId}` : ""}`)
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
          const catName = categories.find(c => c.id === Number(newAssetSelection.category_id))?.name || "Cat";
          
          const isOther = newAssetSelection.model_name === "Other";
          let detailedDesc = "";

          if (isOther) {
            // COMPACT FORMAT to fit within VARCHAR(100)
            detailedDesc = `[Other] ${catName} | ${newAssetSelection.otherBrand} | ${newAssetSelection.otherModel} | ${formData.description || ""}`.substring(0, 100);
          } else {
            detailedDesc = `[New Asset Request]
Category: ${catName}
Type: ${newAssetSelection.asset_type}
Model: ${newAssetSelection.model_name}

Description: ${formData.description}`;
          }

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
      request_type: "",
      reason: "",
      description: "",
      priority: "",
    })
    setNewAssetSelection({
      category_id: "",
      asset_type: "",
      model_name: "",
      otherBrand: "",
      otherModel: ""
    })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category] || []
      const isRemoving = current.includes(value)
      const updated = isRemoving
        ? current.filter(v => v !== value)
        : [...current, value]

      let result = { ...prev, [category]: updated }

      // --- Cascade Logic (Tiered) ---

      // 1. If Location is removed, validify Rooms, Supervisors, and Requesters
      if (category === 'location' && isRemoving) {
        const remainingLocations = updated
        const validRooms = new Set(
          requests
            .filter(r => remainingLocations.length === 0 || remainingLocations.includes(r.location_name))
            .map(r => r.room_name)
            .filter(Boolean)
        )
        result.room = result.room.filter(name => validRooms.has(name))

        const validSups = new Set(
          requests
            .filter(r => remainingLocations.length === 0 || remainingLocations.includes(r.location_name))
            .filter(r => result.room.length === 0 || result.room.includes(r.room_name))
            .map(r => r.supervisor_name)
            .filter(Boolean)
        )
        result.supervisor = result.supervisor.filter(name => validSups.has(name))

        const validEmps = new Set(
          requests
            .filter(r => result.supervisor.length === 0 || result.supervisor.includes(r.supervisor_name))
            .map(r => r.requester_name)
            .filter(Boolean)
        )
        result.requester = result.requester.filter(name => validEmps.has(name))
      }

      // 2. If Room is removed, validify Supervisors and Requesters
      if (category === 'room' && isRemoving) {
        const remainingRooms = updated
        const validSups = new Set(
          requests
            .filter(r => result.location.length === 0 || result.location.includes(r.location_name))
            .filter(r => remainingRooms.length === 0 || remainingRooms.includes(r.room_name))
            .map(r => r.supervisor_name)
            .filter(Boolean)
        )
        result.supervisor = result.supervisor.filter(name => validSups.has(name))

        const validEmps = new Set(
          requests
            .filter(r => result.supervisor.length === 0 || result.supervisor.includes(r.supervisor_name))
            .map(r => r.requester_name)
            .filter(Boolean)
        )
        result.requester = result.requester.filter(name => validEmps.has(name))
      }

      // 3. If Supervisor is removed, validify Requesters (Existing logic expanded)
      if (category === 'supervisor' && isRemoving) {
        const remainingSupervisors = updated
        const validEmps = new Set(
          requests
            .filter(r => remainingSupervisors.length === 0 || remainingSupervisors.includes(r.supervisor_name))
            .map(r => r.requester_name)
            .filter(Boolean)
        )
        result.requester = result.requester.filter(name => validEmps.has(name))
      }

      return result
    })
  }



  // eslint-disable-next-line no-unused-vars
  const clearFilters = () => {

    setFilters({
      status: [],
      priority: [],
      type: [],
      requester: [],
      location: [],
      room: [],
      supervisor: [],
    })
  }

  const uniqueRequesters = [...new Set(
    requests
      .filter(r => filters.supervisor.length === 0 || filters.supervisor.includes(r.supervisor_name))
      .map(r => r.requester_name)
      .filter(Boolean)
  )]
  const uniqueSupervisors = [...new Set(
    requests
      .filter(r => filters.location.length === 0 || filters.location.includes(r.location_name))
      .filter(r => filters.room.length === 0 || filters.room.includes(r.room_name))
      .map(r => r.supervisor_name)
      .filter(Boolean)
  )]
  const uniqueLocations = [...new Set(requests.map(r => r.location_name).filter(Boolean))]
  const uniqueRooms = [...new Set(
    requests
      .filter(r => filters.location.length === 0 || filters.location.includes(r.location_name))
      .map(r => r.room_name)
      .filter(Boolean)
  )]

  const filteredRequests = requests.filter((request) => {
    return (
      (filters.status.length === 0 || filters.status.includes(request.status)) &&
      (filters.priority.length === 0 || filters.priority.includes(request.priority)) &&
      (filters.type.length === 0 || filters.type.includes(request.request_type)) &&
      (filters.requester.length === 0 || filters.requester.includes(request.requester_name)) &&
      (filters.location.length === 0 || filters.location.includes(request.location_name)) &&
      (filters.room.length === 0 || filters.room.includes(request.room_name)) &&
      (filters.supervisor.length === 0 || filters.supervisor.includes(request.supervisor_name))
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

    // For new asset requests, extract structured details from description
    if (request.request_type === "New Asset" && request.description) {
      // Compact "Other" format: [Other] Cat | Brand | Product | Desc
      if (request.description.startsWith("[Other]")) {
        const parts = request.description.split(" | ")
        if (parts.length >= 3) {
          return `${parts[1].trim()} - ${parts[2].trim()}`
        }
      }

      // New "Other" format (multi-line): Asset : Other + Model-Company + Model-Product
      if (request.description.includes("Asset : Other")) {
        const companyMatch = request.description.match(/Model-Company:\s*(.+?)(?:\n|$)/)
        const productMatch = request.description.match(/Model-Product:\s*(.+?)(?:\n|$)/)
        if (companyMatch && productMatch) {
          return `${companyMatch[1].trim()} - ${productMatch[1].trim()}`
        }
      }

      // Fallback/Legacy "Other" format: Model: Other (xxx)
      const modelMatch = request.description.match(/Model:\s*(.+?)(?:\n|$)/)
      if (modelMatch && modelMatch[1]) {
        const model = modelMatch[1].trim()
        if (model.startsWith("Other (")) {
          const brandMatch = request.description.match(/Brand:\s*(.+?)(?:\n|$)/)
          const productName = model.match(/Other \((.+?)\)/)?.[1]
          if (brandMatch && productName) {
            return `${brandMatch[1].trim()} - ${productName}`
          }
        }
        return model
      }

      return "New Asset Request"
    }

    return "N/A"
  }

  if (loading) {
    return <div className="loading">Loading requests...</div>
  }

  if ((role === "supervisor" || role === "employee") && !user?.room_id) {
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
      <div className="action-bar mb-4">
        <div className="action-bar-left">
          <h2 className="page-title">
            {role === "employee"
              ? "My Requests"
              : role === "supervisor"
                ? "Request Management"
                : "All Requests"}
      </h2>
        </div>
        <div className="action-bar-right">
          <button 
            className={`btn ${Object.values(filters).some(arr => arr.length > 0) ? 'btn-primary' : 'btn-secondary'} mr-2`}
            onClick={() => setShowFilterModal(true)}
          >
            Filters {Object.values(filters).flat().length > 0 && `(${Object.values(filters).flat().length})`}
          </button>
          {(role === "employee" || role === "supervisor") && (
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
          {/* {user?.role === "Supervisor" && (
            <div className="flex gap-2">
              <button
                className={`btn ${view === "my" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setView("my")}
              >
                My Requests
              </button>
              <button
                className={`btn ${view === "team" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setView("team")}
              >
                My Team's Requests
              </button>
            </div>
          )} */}
        </div>
      </div>

      {/* Inline filters removed in favor of FilterModal */}

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
                {role !== "employee" && <th>Location</th>}
                {role !== "employee" && <th>Requested By</th>}
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
                  <td>
                    {request.request_type === "New Asset" && (request.description?.includes("Asset : Other") || request.description?.startsWith("[Other]"))
                      ? "New Asset - Other" 
                      : request.request_type}
                  </td>
                  <td>{getAssetDisplay(request)}</td>
                  {role !== "employee" && <td>{request.location_name || "N/A"}</td>}
                  {role !== "employee" && <td>{request.requester_name || "N/A"}</td>}
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
                      {role === "employee" && request.status === "Pending" && (
                        <>
                          <button onClick={() => handleEdit(request)} className="btn btn-secondary">
                            Edit
                          </button>
                        </>
                      )}
                      {(role === "supervisor" || role === "super admin") && (
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
                          {/* Complete button removed as requested */}
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
                    <option value="">Select Request Type</option>
                    <option value="Repair">Repair</option>
                    <option value="Replacement">Replacement</option>
                    <option value="New Asset">New Asset</option>
                  </select>
                </div>

                {formData.request_type && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Asset Type</label>
                      <select
                        className="form-select"
                        value={newAssetSelection.asset_type}
                        onChange={(e) => setNewAssetSelection({ ...newAssetSelection, asset_type: e.target.value })}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Software">Software</option>
                      </select>
                    </div>

                    {newAssetSelection.asset_type && (
                      <>
                        {formData.request_type !== "New Asset" ? (
                          <div className="form-group">
                            <label className="form-label">Your Asset</label>
                            <select name="asset_id" className="form-select" value={formData.asset_id} onChange={handleChange} required>
                              <option value="">Select Your Assign Asset</option>
                              {assets
                                .filter(asset => asset.asset_type === newAssetSelection.asset_type)
                                .map((asset) => (
                                <option key={asset.id} value={asset.id}>
                                  {asset.name} - {asset.serial_number}
                                </option>
                              ))}
                            </select>
                            <small className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                              Showing only {newAssetSelection.asset_type.toLowerCase()} assets assigned to {role === "supervisor" ? "you or your team" : "you"}.
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
                              <>
                                <div className="form-group">
                                  <label className="form-label">Model</label>
                                  <select
                                    className="form-select"
                                    value={newAssetSelection.model_name}
                                    onChange={(e) => setNewAssetSelection({ ...newAssetSelection, model_name: e.target.value })}
                                    required
                                  >
                                    <option value="">Select Model</option>
                                    {uniqueAssets
                                      .filter(a => a.category_id === Number(newAssetSelection.category_id) && a.asset_type === newAssetSelection.asset_type)
                                      .map(a => (
                                        <option key={a.id} value={a.name}>{a.name}</option>
                                      ))}
                                    <option value="Other">Other</option>
                                  </select>
                                </div>

                                {newAssetSelection.model_name === "Other" && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                      <label className="form-label">Company/Brand Name</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={newAssetSelection.otherBrand}
                                        onChange={(e) => setNewAssetSelection({ ...newAssetSelection, otherBrand: e.target.value })}
                                        placeholder="e.g. Dell, HP, Apple"
                                        required
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label className="form-label">Model/Product Name</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={newAssetSelection.otherModel}
                                        onChange={(e) => setNewAssetSelection({ ...newAssetSelection, otherModel: e.target.value })}
                                        placeholder="e.g. Latitude 5420"
                                        required
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                        {((formData.request_type !== "New Asset" && formData.asset_id) || (formData.request_type === "New Asset" && newAssetSelection.model_name)) && (
                          <>
                            <div className="form-group">
                              <label className="form-label">Reason</label>
                              <input
                                type="text"
                                name="reason"
                                className="form-input"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Reason for the request"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Description (Optional)</label>
                              <textarea
                                name="description"
                                className="form-input"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Detailed description of the request"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Priority</label>
                              <select name="priority" className="form-select" value={formData.priority} onChange={handleChange} required>
                                <option value="" disabled>Select Priority</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>

                            <div className="modal-footer" style={{ marginTop: '1rem', padding: 0, borderTop: 'none' }}>
                                <div className="flex gap-2">
                                  {(formData.reason && formData.priority) && (
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                      {editingRequest ? "Update Request" : "Submit Request"}
                                    </button>
                                  )}
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
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
      {showFilterModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>Filter Requests</h2>
              <button className="close-modal" onClick={() => setShowFilterModal(false)} style={{ fontSize: '1.5rem' }}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem 0' }}>
              {(() => {
                const role = user?.role?.toLowerCase();
                const isSuperAdmin = role === "super admin"
                const isSupervisor = role === "supervisor"
                const locationSelected = filters.location.length > 0
                const supervisorSelected = filters.supervisor.length > 0

                const h4 = { color: '#b0b0b0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: '600' }
                const col = { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                const lbl = { display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '4px 0', fontSize: '0.95rem' }
                const chk = { width: '18px', height: '18px', cursor: 'pointer' }
                const txt = (on) => ({ color: on ? '#007bff' : '#e0e0e0', fontWeight: on ? '600' : 'normal' })
                const scrollCol = { display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto' }

                // Use module-level FilterSH so its reference is stable across renders
                const clearCat = (cat) => setFilters(prev => ({ ...prev, [cat]: [] }))
                const SH = (props) => <FilterSH {...props} onClear={clearCat} />

                // ---- Inline filter JSX ----
                const priorityJSX = (
                  <div>
                    <FilterSH category="priority" selected={filters.priority} label="Priority" onClear={clearCat} listLength={4} />
                    <div style={col}>
                      {["Low","Medium","High","Critical"].map(p => (
                        <label key={p} style={lbl}>
                          <input type="checkbox" checked={filters.priority.includes(p)} onChange={() => toggleFilter('priority', p)} style={chk} />
                          <span style={txt(filters.priority.includes(p))}>{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
                const typeJSX = (
                  <div>
                    <FilterSH category="type" selected={filters.type} label="Request Type" onClear={clearCat} listLength={3} />
                    <div style={col}>
                      {["Repair","Replacement","New Asset"].map(t => (
                        <label key={t} style={lbl}>
                          <input type="checkbox" checked={filters.type.includes(t)} onChange={() => toggleFilter('type', t)} style={chk} />
                          <span style={txt(filters.type.includes(t))}>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
                const statusJSX = (
                  <div>
                    <FilterSH category="status" selected={filters.status} label="Status" onClear={clearCat} listLength={4} />
                    <div style={col}>
                      {["Pending","In Progress","Rejected","Completed"].map(s => (
                        <label key={s} style={lbl}>
                          <input type="checkbox" checked={filters.status.includes(s)} onChange={() => toggleFilter('status', s)} style={chk} />
                          <span style={txt(filters.status.includes(s))}>{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
                const locationJSX = (
                  <div>
                    <FilterSH category="location" selected={filters.location} label="Location" onClear={clearCat} listLength={uniqueLocations.length} />
                    <div style={scrollCol}>
                      {uniqueLocations.map(name => (
                        <label key={name} style={lbl}>
                          <input type="checkbox" checked={filters.location.includes(name)} onChange={() => toggleFilter('location', name)} style={chk} />
                          <span style={txt(filters.location.includes(name))}>{name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
                const roomJSX = (
                  <div>
                    <FilterSH category="room" selected={filters.room} label="Room" onClear={clearCat} listLength={uniqueRooms.length} />
                    <div style={scrollCol}>
                      {uniqueRooms.length > 0 ? uniqueRooms.map(name => (
                        <label key={name} style={lbl}>
                          <input type="checkbox" checked={filters.room.includes(name)} onChange={() => toggleFilter('room', name)} style={chk} />
                          <span style={txt(filters.room.includes(name))}>{name}</span>
                        </label>
                      )) : <p style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>No rooms found</p>}
                    </div>
                  </div>
                )
                const supervisorJSX = (
                  <div>
                    <FilterSH category="supervisor" selected={filters.supervisor} label="Supervisor" onClear={clearCat} listLength={uniqueSupervisors.length} />
                    <div style={scrollCol}>
                      {uniqueSupervisors.map(name => (
                        <label key={name} style={lbl}>
                          <input type="checkbox" checked={filters.supervisor.includes(name)} onChange={() => toggleFilter('supervisor', name)} style={chk} />
                          <span style={txt(filters.supervisor.includes(name))}>{name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
                const employeeJSX = (
                  <div>
                    <FilterSH category="requester" selected={filters.requester} label="Employee" onClear={clearCat} listLength={uniqueRequesters.length} />
                    <div style={scrollCol}>
                      {uniqueRequesters.map(name => (
                        <label key={name} style={lbl}>
                          <input type="checkbox" checked={filters.requester.includes(name)} onChange={() => toggleFilter('requester', name)} style={chk} />
                          <span style={txt(filters.requester.includes(name))}>{name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
                const requesterJSX = (
                  <div>
                    <FilterSH category="requester" selected={filters.requester} label="Requested By" onClear={clearCat} listLength={uniqueRequesters.length} />
                    <div style={scrollCol}>

                      {uniqueRequesters.map(name => (
                        <label key={name} style={lbl}>
                          <input type="checkbox" checked={filters.requester.includes(name)} onChange={() => toggleFilter('requester', name)} style={chk} />
                          <span style={txt(filters.requester.includes(name))}>{name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )

                const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }
                const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }
                const col1 = { display: 'flex', flexDirection: 'column', gap: '1.5rem' }

                // STATE 3: Supervisor selected (Super Admin)
                if (isSuperAdmin && supervisorSelected) {
                  return (
                    <div key="s3" style={col1}>
                      <div style={grid3}>{priorityJSX}{typeJSX}{statusJSX}</div>
                      <div style={grid2}>
                        {locationJSX}{roomJSX}
                        {supervisorJSX}{employeeJSX}
                      </div>
                    </div>
                  )
                }

                // STATE 2: Location selected, no supervisor (Super Admin)
                if (isSuperAdmin && locationSelected) {
                  return (
                    <div key="s2" style={col1}>
                      <div style={grid3}>{priorityJSX}{typeJSX}{statusJSX}</div>
                      <div style={grid3}>{locationJSX}{roomJSX}{supervisorJSX}</div>
                    </div>
                  )
                }

                // STATE 1: Default Super Admin
                if (isSuperAdmin) {
                  return (
                    <div key="s1" style={col1}>
                      <div style={grid2}>{priorityJSX}{typeJSX}</div>
                      <div style={grid2}>{statusJSX}{locationJSX}</div>
                    </div>
                  )
                }

                // Supervisor role
                if (isSupervisor) {
                  return (
                    <div key="s1" style={col1}>
                      <div style={grid2}>{priorityJSX}{typeJSX}</div>
                      <div style={grid2}>{statusJSX}{requesterJSX}</div>
                    </div>
                  )
                }

                // Employee / other role
                return (
                  <div key="emp" style={col1}>
                    <div style={grid3}>{priorityJSX}{typeJSX}{statusJSX}</div>
                  </div>
                )
              })()}
            </div>


          </div>
        </div>
      )}
    </div>
  )
}

export default Requests
