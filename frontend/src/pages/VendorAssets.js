"use client"
import { useState } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"

const VendorAssets = () => {
  const { user } = useAuth()
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
    <div>
      <h2>Provide New Assets</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Asset Name" onChange={handleChange} required />
        <input type="text" name="description" placeholder="Description" onChange={handleChange} />
        <select name="asset_type" onChange={handleChange}>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
        </select>
        <input type="number" name="purchase_cost" placeholder="Cost" onChange={handleChange} />
        <input type="date" name="warranty_expiry" onChange={handleChange} />
        <button type="submit">Submit Asset</button>
      </form>
    </div>
  )
}

export default VendorAssets
