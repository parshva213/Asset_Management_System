
"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../api"

const LocationAssets = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lid = searchParams.get("lid")

  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("Assets")

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/assets?location_id=${lid}`)
      setAssets(response.data)
      
      if (lid) {
        const locRes = await api.get(`/locations/${lid}`)
        setTitle(`Manage Assets for ${locRes.data.name}`)
      } else {
        setTitle("All Assets")
      }
      
    } catch (err) {
      console.error("Error fetching assets:", err)
    } finally {
      setLoading(false)
    }
  }, [lid])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  if (loading) return <div className="loading">Loading assets...</div>

  return (
    <div className="content">
      <div className="flex-between mb-4">
        <div>
          <button 
            onClick={() => navigate(`/locations`)} 
            className="btn btn-secondary mb-2"
            style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}
          >
            ← Back to location
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
                <th>Quantity</th>
                <th>Assigned</th>
                <th>Active</th>
                <th>Not Active</th>
                <th>Category</th>
                </tr>
            </thead>
            <tbody>
                {assets.map((asset, index) => (
                <tr key={index}>
                    <td>{asset.aname}</td>
                    <td>{asset.quantity}</td>
                    <td>{asset.assigned_total || 0}</td>
                    <td>{asset.active}</td>
                    <td>{asset.not_active}</td>
                    <td>{asset.cat_name || "N/A"}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  )
}

export default LocationAssets
