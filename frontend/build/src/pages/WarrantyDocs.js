"use client"

import { useState } from "react"

const WarrantyDocs = () => {
  const [warrantyNumber, setWarrantyNumber] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (warrantyNumber.trim() === "") {
      alert("Please enter a warranty number.")
      return
    }
    console.log("Warranty Number:", warrantyNumber)
    alert("Warranty number submitted successfully!")
  }

  return (
    <div className="page-container flex-center">
      <div className="card form-container w-full max-w-md">
        <h3>Warranty Number</h3>
        <p className="text-secondary mb-6 text-sm">Enter and manage warranty numbers for supplied assets.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Warranty Number</label>
            <input
              type="text"
              className="form-input"
              value={warrantyNumber}
              onChange={(e) => setWarrantyNumber(e.target.value)}
              required
              placeholder="Enter warranty number"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4">Submit</button>
        </form>
      </div>
    </div>
  )
}

export default WarrantyDocs
