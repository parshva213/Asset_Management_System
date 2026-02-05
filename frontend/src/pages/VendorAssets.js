"use client"
import { useState } from "react"
import api from "../api"

const VendorAssets = () => {
  const [asset, setAsset] = useState({
    name: "",
    description: "",
    asset_type: "Hardware",
    purchase_cost: "",
    warranty_expiry: "",
  })

  const handleChange = (e) => {
    setAsset({ ...asset, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/vendor/assets", asset)
      alert("Asset submitted successfully!")
      setAsset({
        name: "",
        description: "",
        asset_type: "Hardware",
        purchase_cost: "",
        warranty_expiry: "",
      })
    } catch (err) {
      console.error(err)
      alert("Error submitting asset")
    }
  }

  return (
    <div className="page-container flex-center">
      <div className="card form-container w-full max-w-lg">
        <h3>Provide New Assets</h3>
        <p className="text-secondary mb-6 text-sm">Register new assets into the system.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
             <label className="form-label">Asset Name</label>
            <input type="text" name="name" className="form-input" placeholder="Asset Name" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input type="text" name="description" className="form-input" placeholder="Description" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Asset Type</label>
            <select name="asset_type" className="form-select" onChange={handleChange}>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Cost</label>
            <input type="number" name="purchase_cost" className="form-input" placeholder="Cost" onChange={handleChange} />
          </div>
          <div className="form-group">
             <label className="form-label">Warranty Expiry</label>
            <input type="date" name="warranty_expiry" className="form-input" onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4">Submit Asset</button>
        </form>
      </div>
    </div>
  )
}

export default VendorAssets
