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
    <div className="page-container">
      <h2>Supply New Assets</h2>
      <p>Provide hardware/software assets and update delivery details.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Asset Name:
          <input type="text" name="assetName" value={form.assetName} onChange={handleChange} required />
        </label>
        <label>
          Asset Type:
          <input type="text" name="assetType" value={form.assetType} onChange={handleChange} required />
        </label>
        <label>
          Delivery Date:
          <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} required />
        </label>
        <label>
          Notes:
          <textarea name="notes" value={form.notes} onChange={handleChange}></textarea>
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default SupplyAssets
