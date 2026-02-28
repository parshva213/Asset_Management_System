"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import api from "../api"
import { useToast } from "../contexts/ToastContext"
import { formatDate } from "../utils/dateUtils"

const SupplyAssets = () => {
  const { showSuccess, showError, showInfo } = useToast()
  const [requirements, setRequirements] = useState([])
  const [quoteValues, setQuoteValues] = useState({})
  const [supplyDetails, setSupplyDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState(null)

  const fetchRequirements = useCallback(async () => {
    try {
      const response = await api.get("/purchase-orders/vendor/requirements")
      const rows = Array.isArray(response.data) ? response.data : []
      setRequirements(rows)

      const nextQuotes = {}
      const nextSupplyDetails = {}
      rows.forEach((row) => {
        if (row.status === "Requested") {
          nextQuotes[row.id] = row.quote || ""
        }
        if (row.status === "Approved") {
          nextSupplyDetails[row.id] = {
            quantity: "",
            warranty_expiry: "",
          }
        }
      })
      setQuoteValues(nextQuotes)
      setSupplyDetails(nextSupplyDetails)
    } catch (error) {
      console.error("Error loading vendor requirements:", error)
      showError(error?.message || "Failed to load requirements")
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchRequirements()
  }, [fetchRequirements])

  const updateQuoteValue = (orderId, value) => {
    setQuoteValues((prev) => ({ ...prev, [orderId]: value }))
  }

  const updateSupplyDetails = (orderId, key, value) => {
    setSupplyDetails((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [key]: value,
      },
    }))
  }

  const submitQuote = async (order) => {
    const quoteValue = Number(quoteValues[order.id])
    if (!Number.isFinite(quoteValue) || quoteValue <= 0) {
      showInfo("Please enter a valid quotation amount")
      return
    }

    setSubmittingId(order.id)
    try {
      await api.put(`/purchase-orders/${order.id}/status`, {
        status: "Quoted",
        quote: quoteValue,
      })
      showSuccess("Quotation submitted successfully")
      await fetchRequirements()
    } catch (error) {
      console.error("Error submitting quote:", error)
      showError(error?.message || "Failed to submit quotation")
    } finally {
      setSubmittingId(null)
    }
  }

  const markSupplied = async (order) => {
    const payload = supplyDetails[order.id] || {}
    const supplyQty = Number(payload.quantity)
    const warrantyExpiry = payload.warranty_expiry

    if (!Number.isInteger(supplyQty) || supplyQty <= 0) {
      showInfo("Enter a valid supply quantity")
      return
    }
    if (supplyQty > Number(order.quantity)) {
      showInfo("Supply quantity cannot exceed pending quantity")
      return
    }
    if (!warrantyExpiry) {
      showInfo("Select warranty expiry date")
      return
    }

    setSubmittingId(order.id)
    try {
      const response = await api.put(`/purchase-orders/${order.id}/status`, {
        status: "Delivered",
        supply_quantity: supplyQty,
        warranty_expiry: warrantyExpiry,
      })
      showSuccess(response?.data?.message || "Supply updated")
      await fetchRequirements()
    } catch (error) {
      console.error("Error marking supplied:", error)
      showError(error?.message || "Failed to mark supplied")
    } finally {
      setSubmittingId(null)
    }
  }

  const stats = useMemo(() => {
    const uniqueCompanies = new Set()
    let requestedCount = 0
    let approvedQuantity = 0

    requirements.forEach((row) => {
      if (row.organization_name) {
        uniqueCompanies.add(row.organization_name)
      }
      if (row.status === "Requested") {
        requestedCount += 1
      }
      if (row.status === "Approved") {
        approvedQuantity += Number(row.quantity) || 0
      }
    })

    return {
      companyCount: uniqueCompanies.size,
      requestedCount,
      approvedQuantity,
    }
  }, [requirements])

  const formatWarrantyPeriod = (days) => {
    const value = Number(days)
    if (!Number.isFinite(value) || value < 0) return "-"
    return `${value} days`
  }

  if (loading) {
    return <div className="loading">Loading requirements...</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Supply Requirements</h2>
        <p>Quotations can be submitted only for organizations you registered with.</p>
      </div>

      <div className="flex gap-2 mb-4" style={{ flexWrap: "wrap" }}>
        <div className="card">
          <h4>Registered Companies</h4>
          <p>{stats.companyCount}</p>
        </div>
        <div className="card">
          <h4>Pending Quotations</h4>
          <p>{stats.requestedCount}</p>
        </div>
        <div className="card">
          <h4>Approved To Supply</h4>
          <p>{stats.approvedQuantity}</p>
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className="empty-state">
          <h3>No requirements found</h3>
          <p>Register organizations first, then their requirements will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Asset</th>
                <th>Pending Qty</th>
                <th>Supervisor</th>
                <th>Quote</th>
                <th>Supplied</th>
                <th>Supply Date</th>
                <th>Set Warranty Expiry</th>
                <th>Warranty Period</th>
                <th>Supply Qty</th>
                <th>Warranty Expiry</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((order) => (
                <tr key={order.id} id={`supply-req-${order.id}`}>
                  <td>{order.organization_name || "N/A"}</td>
                  <td>{order.asset_name}</td>
                  <td>{order.quantity}</td>
                  <td>{order.supervisor_name || order.supervisor_id}</td>
                  <td>
                    {order.status === "Requested" ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        placeholder="Enter quote"
                        value={quoteValues[order.id] ?? ""}
                        onChange={(e) => updateQuoteValue(order.id, e.target.value)}
                        style={{ minWidth: "140px" }}
                      />
                    ) : order.quote ? (
                      order.quote
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{order.supplied_quantity || 0}</td>
                  <td>{order.supply_date ? formatDate(order.supply_date) : "-"}</td>
                  <td>{order.warranty_expiry ? formatDate(order.warranty_expiry) : "-"}</td>
                  <td>{formatWarrantyPeriod(order.warranty_period_days)}</td>
                  <td>
                    {order.status === "Approved" ? (
                      <input
                        type="number"
                        min="1"
                        max={order.quantity}
                        className="form-input"
                        value={supplyDetails[order.id]?.quantity ?? ""}
                        onChange={(e) => updateSupplyDetails(order.id, "quantity", e.target.value)}
                        placeholder={`max ${order.quantity}`}
                        style={{ minWidth: "120px" }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {order.status === "Approved" ? (
                      <input
                        type="date"
                        className="form-input"
                        value={supplyDetails[order.id]?.warranty_expiry ?? ""}
                        onChange={(e) => updateSupplyDetails(order.id, "warranty_expiry", e.target.value)}
                        style={{ minWidth: "160px" }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{order.status}</td>
                  <td>
                    {order.status === "Requested" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => submitQuote(order)}
                        disabled={submittingId === order.id}
                      >
                        {submittingId === order.id ? "Submitting..." : "Submit Quote"}
                      </button>
                    )}
                    {order.status === "Approved" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => markSupplied(order)}
                        disabled={submittingId === order.id}
                      >
                        {submittingId === order.id ? "Supplying..." : "Supply"}
                      </button>
                    )}
                    {order.status !== "Requested" && order.status !== "Approved" && <span>-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-secondary" style={{ marginTop: "1rem" }}>
        Supply is allowed only after Admin approves your quotation.
      </div>
    </div>
  )
}

export default SupplyAssets
