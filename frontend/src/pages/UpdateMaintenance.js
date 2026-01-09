"use client"

import { useState } from "react"

const UpdateMaintenance = () => {
  const [form, setForm] = useState({
    assetId: "",
    maintenanceType: "",
    maintenanceDate: "",
    remarks: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Maintenance Data:", form)
    alert("Maintenance record updated successfully!")
  }

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="card form-container" style={{ width: '100%' }}>
        <h3>Update Maintenance Records</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Record maintenance activities like repairs, replacements, and checks.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Asset ID</label>
            <input 
              type="text" 
              name="assetId" 
              value={form.assetId} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Maintenance Type</label>
            <input 
              type="text" 
              name="maintenanceType" 
              value={form.maintenanceType} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Maintenance Date</label>
            <input 
              type="date" 
              name="maintenanceDate" 
              value={form.maintenanceDate} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea 
              name="remarks" 
              value={form.remarks} 
              onChange={handleChange}
              className="form-input"
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Update Record
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateMaintenance

