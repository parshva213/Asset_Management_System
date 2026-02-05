
"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../api"
import { formatDate } from "../utils/dateUtils"

const LocationRoomAssets = () => {
  // Removed unused user
  const [searchParams] = useSearchParams()
  const lid = searchParams.get("lid")
  const rid = searchParams.get("rid")

  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("Assets")

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      let endpoint = "/assets"
      const params = new URLSearchParams()
      
      if (lid) params.append("location_id", lid)
      if (rid) params.append("room_id", rid)

      const response = await api.get(`${endpoint}?${params.toString()}`)
      setAssets(response.data)
      
      if (lid) setTitle("Location Assets")
      if (rid) setTitle("Room Assets")
      
    } catch (err) {
      console.error("Error fetching assets:", err)
    } finally {
      setLoading(false)
    }
  }, [lid, rid])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  if (loading) return <div className="loading">Loading assets...</div>

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>{title}</h2>
      </div>

      {assets.length === 0 ? (
        <div className="empty-state">
          <p>No assets found</p>
        </div>
      ) : (
        <div className="table-container">
            <table className="table">
            <thead>
                <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Serial Number</th>
                <th>Warranty Expiry</th>
                <th>Category</th>
                <th>Location</th>
                <th>Purchase Date</th>
                {/* Add count column if backend returns it */}
                {assets[0].count !== undefined && <th>Count</th>} 
                </tr>
            </thead>
            <tbody>
                {assets.map((asset, index) => (
                <tr key={asset.id || index}>
                    <td>{asset.name}</td>
                    <td>{asset.asset_type}</td>
                    <td>{asset.serial_number || "N/A"}</td>
                    <td>{formatDate(asset.warranty_expiry) || "N/A"}</td>
                    <td>{asset.category_name || "N/A"}</td>
                    <td>{asset.location_name || "N/A"}</td>
                    <td>{formatDate(asset.purchase_date) || "N/A"}</td>
                    {asset.count !== undefined && <td>{asset.count}</td>}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  )
}

export default LocationRoomAssets
