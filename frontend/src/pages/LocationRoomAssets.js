
"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../api"
import { formatDate } from "../utils/dateUtils"

const LocationRoomAssets = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lid = searchParams.get("locid")
  const rid = searchParams.get("roomid")

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
      
      if (lid) {
        const locRes = await api.get(`/locations/${lid}`)
        setTitle(`Manage Assets for ${locRes.data.name}`)
      } else if (rid) {
        const roomRes = await api.get(`/locations/rooms/${rid}`)
        setTitle(`Manage Assets for ${roomRes.data.name} in ${roomRes.data.location_name}`)
      } else {
        setTitle("All Assets")
      }
      
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
    <div className="content">
      <div className="flex-between mb-4">
        <div>
          <button 
            onClick={() => navigate(`/rooms?location_id=${lid}`)} 
            className="btn btn-secondary mb-2"
            style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}
          >
            ← Back to Room
          </button>
          <h2>{title}</h2>
        </div>
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
