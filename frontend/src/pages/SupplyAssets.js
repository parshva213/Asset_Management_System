"use client"

import { useState } from "react"
import api from "../api"

const SupplyAssets = () => {
  const [form, setForm] = useState({
    assetName: "",
    assetType: "",
    deliveryDate: "",
    warrantyNumber: "",
    notes: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/supply-assets", form)
      alert("Asset supply submitted successfully!")
      setForm({
        assetName: "",
        assetType: "",
        deliveryDate: "",
        warrantyNumber: "",
        notes: ""
      })
    } catch (error) {
      console.error("Error submitting asset supply:", error)
      alert("Error submitting asset supply")
    }
  }

  return (
    <div className="page-container flex-center">
      <div className="card form-container w-full max-w-lg">
        <h3>Supply New Assets</h3>
        <p className="text-secondary mb-6">Provide hardware/software assets and update delivery details.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Asset Name</label>
            <input 
              type="text" 
              name="assetName" 
              value={form.assetName} 
              onChange={handleChange} 
              className="form-input"
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Asset Type</label>
            <input 
              type="text" 
              name="assetType" 
              value={form.assetType} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Date</label>
            <input 
              type="date" 
              name="deliveryDate" 
              value={form.deliveryDate} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              className="form-input"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4">Submit</button>
        </form>
      </div>
    </div>
  )
}

export default SupplyAssets
