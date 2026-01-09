"use client"

import { useState } from "react"

const NewConfiguration = () => {
  const [form, setForm] = useState({
    assetId: "",
    configDetails: "",
    assignedTo: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Configuration Data:", form)
    alert("New configuration recorded successfully!")
  }

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="card form-container" style={{ width: '100%' }}>
        <h3>Configure New Assets</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Maintenance staff can configure new hardware/software here.
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
            <label className="form-label">Configuration Details</label>
            <textarea 
              name="configDetails" 
              value={form.configDetails} 
              onChange={handleChange} 
              className="form-input"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <input 
              type="text" 
              name="assignedTo" 
              value={form.assignedTo} 
              onChange={handleChange} 
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  )
}

export default NewConfiguration
