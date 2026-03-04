import { useState, useEffect, useCallback } from "react"


import api from "../api"

import { useToast } from "../contexts/ToastContext"
import { formatDate } from "../utils/dateUtils"


const UpdateMaintenance = () => {
  const { showSuccess, showError } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRecord, setEditingRecord] = useState(null)

  const [form, setForm] = useState({
    assetId: "",
    maintenanceType: "",
    maintenanceDate: "",
    remarks: "",
    status: "Pending"
  })

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/maintenance")
      // Filter for regular maintenance (non-configuration)
      const regularMaintenance = res.data.filter(rec => rec.maintenance_type !== "Configuration")
      setRecords(regularMaintenance)
    } catch (err) {
      console.error("Error fetching maintenance records:", err)
      showError("Failed to load maintenance records")
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const resetForm = () => {
    setForm({
      assetId: "",
      maintenanceType: "",
      maintenanceDate: "",
      remarks: "",
      status: "Pending"
    })
    setEditingRecord(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        asset_id: form.assetId,
        maintenance_type: form.maintenanceType,
        description: form.remarks,
        status: form.status,
        maintenance_by: "self"
      }

      if (editingRecord) {
        await api.put(`/maintenance/${editingRecord.id}`, payload)
        showSuccess("Maintenance record updated successfully!")
      } else {
        await api.post("/maintenance", payload)
        showSuccess("Maintenance record created successfully!")
      }

      setShowModal(false)
      resetForm()
      fetchRecords()
    } catch (err) {
      console.error("Error saving maintenance record:", err)
      showError(err.message || "Failed to save maintenance record")
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setForm({
      assetId: record.asset_id,
      maintenanceType: record.maintenance_type,
      maintenanceDate: record.created_at.split('T')[0],
      remarks: record.description || "",
      status: record.status
    })
    setShowModal(true)
  }


  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Update Maintenance Records</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          Add Record
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading records...</div>
      ) : records.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Maintained By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>#{record.id}</td>
                  <td>{record.asset_name} (ID: {record.asset_id})</td>
                  <td>{record.maintenance_type}</td>
                  <td>{record.maintenance_by_name}</td>
                  <td>{formatDate(record.created_at)}</td>
                  <td>
                    <span className={`status-badge status-${record.status.toLowerCase().replace(" ", "-")}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(record)} className="btn btn-secondary btn-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <p className="text-secondary text-center py-4">
            Click "Add Record" to update maintenance activities.
          </p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingRecord ? "Edit Record" : "Update Records"}</h2>
              <button className="close-modal" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div className="form-group">
                  <label className="form-label">Asset ID</label>
                  <input
                    type="number"
                    name="assetId"
                    value={form.assetId}
                    onChange={handleChange}
                    className="form-input"
                    required
                    readOnly={!!editingRecord}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maintenance Type</label>
                  <select
                    name="maintenanceType"
                    value={form.maintenanceType}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Repair">Repair</option>
                    <option value="Upgrade">Upgrade</option>
                    <option value="Check">Check</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    className="form-input"
                    rows="3"
                  ></textarea>
                </div>

                <div className="modal-footer px-0 pb-0">
                  <div className="flex gap-2 w-full">
                    <button type="submit" className="btn btn-primary flex-1">
                      {editingRecord ? "Update Record" : "Save Record"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary flex-1"
                      onClick={() => { setShowModal(false); resetForm(); }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )

}

export default UpdateMaintenance

