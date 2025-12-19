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
    <div className="page-container">
      <h2>Configure New Assets</h2>
      <p>Maintenance staff can configure new hardware/software here.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Asset ID:
          <input type="text" name="assetId" value={form.assetId} onChange={handleChange} required />
        </label>
        <label>
          Configuration Details:
          <textarea name="configDetails" value={form.configDetails} onChange={handleChange} required></textarea>
        </label>
        <label>
          Assigned To:
          <input type="text" name="assignedTo" value={form.assignedTo} onChange={handleChange} />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}

export default NewConfiguration
