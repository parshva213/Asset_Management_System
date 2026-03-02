"use client"

import { useEffect, useMemo, useState } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { formatDate } from "../utils/dateUtils"

const VendorRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [companyFilter, setCompanyFilter] = useState("")

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/purchase-orders")
        setRequests(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error("Error fetching vendor requests:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [user])

  const deliveredRequests = useMemo(
    () => requests.filter((req) => req.status === "Delivered"),
    [requests]
  )

  const companyOptions = useMemo(() => {
    const set = new Set()
    deliveredRequests.forEach((req) => set.add(req.organization_name || "Unknown Company"))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [deliveredRequests])

  const filteredDeliveredRequests = useMemo(() => {
    if (!companyFilter) return deliveredRequests
    return deliveredRequests.filter((req) => (req.organization_name || "Unknown Company") === companyFilter)
  }, [deliveredRequests, companyFilter])

  const formatWarrantyPeriod = (days) => {
    const value = Number(days)
    if (!Number.isFinite(value) || value < 0) return "-"
    return `${value} days`
  }

  if (loading) {
    return <div className="loading">Loading delivered requests...</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Delivered Assets Info</h2>
        <p>Track full delivery details including destination and recipient.</p>
      </div>

      <div className="filters mb-4">
        <div className="filter-group">
          <label className="form-label">Company</label>
          <select
            className="form-select"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="">All Companies</option>
            {companyOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredDeliveredRequests.length === 0 ? (
        <div className="empty-state">
          <p>No fully delivered assets yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Asset</th>
                <th>Delivered Qty</th>
                <th>To Whom</th>
                <th>Where Delivered</th>
                <th>Supply Date</th>
                <th>Warranty Expiry</th>
                <th>Warranty Period</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveredRequests.map((req) => (
                <tr key={req.id} id={`delivered-po-${req.id}`}>
                  <td>{req.organization_name || "Unknown Company"}</td>
                  <td>{req.asset_name}</td>
                  <td>{req.supplied_quantity || 0}</td>
                  <td>{req.supervisor_name || "N/A"}</td>
                  <td>
                    {(req.supervisor_location_name || "N/A")}
                    {" / "}
                    {(req.supervisor_room_name || "N/A")}
                  </td>
                  <td>{req.supply_date ? formatDate(req.supply_date) : "-"}</td>
                  <td>{req.warranty_expiry ? formatDate(req.warranty_expiry) : "-"}</td>
                  <td>{formatWarrantyPeriod(req.warranty_period_days)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VendorRequests
