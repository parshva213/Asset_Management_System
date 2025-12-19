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
    <div className="page-container">
      <h2>Warranty Number</h2>
      <p>Enter and manage warranty numbers for supplied assets.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Warranty Number:
          <input
            type="text"
            value={warrantyNumber}
            onChange={(e) => setWarrantyNumber(e.target.value)}
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default WarrantyDocs
