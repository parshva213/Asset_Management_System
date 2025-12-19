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
    <div className="page-container">
      <h2>Update Maintenance Records</h2>
      <p>Record maintenance activities like repairs, replacements, and checks.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Asset ID:
          <input type="text" name="assetId" value={form.assetId} onChange={handleChange} required />
        </label>
        <label>
          Maintenance Type:
          <input type="text" name="maintenanceType" value={form.maintenanceType} onChange={handleChange} required />
        </label>
        <label>
          Maintenance Date:
          <input type="date" name="maintenanceDate" value={form.maintenanceDate} onChange={handleChange} required />
        </label>
        <label>
          Remarks:
          <textarea name="remarks" value={form.remarks} onChange={handleChange}></textarea>
        </label>
        <button type="submit">Update</button>
      </form>
    </div>
  )
}

export default UpdateMaintenance

