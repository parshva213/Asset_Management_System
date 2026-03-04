"use client"

import { useEffect, useMemo, useState } from "react"
import api from "../api"
import { useToast } from "../contexts/ToastContext"
import { formatDate } from "../utils/dateUtils"

const VendorAssets = () => {
  const { showError } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [companyFilter, setCompanyFilter] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/purchase-orders")
        setOrders(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Error loading products summary:", error)
        showError(error?.message || "Failed to load products summary")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [showError])

  const companyOptions = useMemo(() => {
    const set = new Set()
    orders.forEach((order) => set.add(order.organization_name || "Unknown Company"))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (!companyFilter) return orders
    return orders.filter((order) => (order.organization_name || "Unknown Company") === companyFilter)
  }, [orders, companyFilter])

  const summary = useMemo(() => {
    const byCompany = {}
    let totalPendingSupply = 0
    let totalSupplied = 0

    filteredOrders.forEach((order) => {
      const company = order.organization_name || "Unknown Company"
      if (!byCompany[company]) {
        byCompany[company] = {
          company,
          pending_supply: 0,
          supplied: 0,
          last_supply_date: null,
          last_warranty_expiry: null,
          last_warranty_period_days: null,
        }
      }

      const quantity = Number(order.quantity) || 0
      const suppliedQty = Number(order.supplied_quantity) || 0

      if (order.status === "Approved") {
        byCompany[company].pending_supply += quantity
        totalPendingSupply += quantity
      }

      byCompany[company].supplied += suppliedQty
      totalSupplied += suppliedQty

      if (order.supply_date) {
        const current = byCompany[company].last_supply_date ? new Date(byCompany[company].last_supply_date).getTime() : 0
        const next = new Date(order.supply_date).getTime()
        if (next > current) {
          byCompany[company].last_supply_date = order.supply_date
          byCompany[company].last_warranty_expiry = order.warranty_expiry || null
          byCompany[company].last_warranty_period_days = order.warranty_period_days ?? null
        }
      }
    })

    const companyRows = Object.values(byCompany).sort((a, b) => a.company.localeCompare(b.company))
    const allRows = [...filteredOrders].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      if (bTime !== aTime) return bTime - aTime
      return (b.id || 0) - (a.id || 0)
    })

    return {
      companyRows,
      allRows,
      totalPendingSupply,
      totalSupplied,
    }
  }, [filteredOrders])

  const formatWarrantyPeriod = (days) => {
    const value = Number(days)
    if (!Number.isFinite(value) || value < 0) return "-"
    return `${value} days`
  }

  if (loading) {
    return <div className="loading">Loading products summary...</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Products And Orders</h2>
        <p>View your latest orders and supply status by company.</p>
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

      <div className="flex gap-2 mb-4" style={{ flexWrap: "wrap" }}>
        <div className="card">
          <h4>Pending Supply Quantity</h4>
          <p>{summary.totalPendingSupply}</p>
        </div>
        <div className="card">
          <h4>Already Supplied Quantity</h4>
          <p>{summary.totalSupplied}</p>
        </div>
      </div>

      {summary.companyRows.length === 0 ? (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>Try changing the company filter.</p>
        </div>
      ) : (
        <div className="table-container mb-4">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Pending To Supply</th>
                <th>Supplied</th>
                <th>Last Supply Date</th>
                <th>Warranty Expiry</th>
                <th>Warranty Period</th>
              </tr>
            </thead>
            <tbody>
              {summary.companyRows.map((row) => (
                <tr key={row.company} id={`company-summary-${row.company}`}>
                  <td>{row.company}</td>
                  <td>{row.pending_supply}</td>
                  <td>{row.supplied}</td>
                  <td>{row.last_supply_date ? formatDate(row.last_supply_date) : "-"}</td>
                  <td>{row.last_warranty_expiry ? formatDate(row.last_warranty_expiry) : "-"}</td>
                  <td>{formatWarrantyPeriod(row.last_warranty_period_days)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary.allRows.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Asset</th>
                <th>Qty</th>
                <th>Supplied Qty</th>
                <th>Status</th>
                <th>Last Supply Date</th>
                <th>Warranty Expiry</th>
                <th>Warranty Period</th>
              </tr>
            </thead>
            <tbody>
              {summary.allRows.map((order) => (
                <tr key={order.id} id={`order-row-${order.id}`}>
                  <td>{order.organization_name || "Unknown Company"}</td>
                  <td>{order.asset_name}</td>
                  <td>{order.quantity}</td>
                  <td>{order.supplied_quantity || 0}</td>
                  <td>{order.status}</td>
                  <td>{order.supply_date ? formatDate(order.supply_date) : "-"}</td>
                  <td>{order.warranty_expiry ? formatDate(order.warranty_expiry) : "-"}</td>
                  <td>{formatWarrantyPeriod(order.warranty_period_days)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VendorAssets
