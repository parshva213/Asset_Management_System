import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"

export default function PurchaseOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [filters, setFilters] = useState({
    status: "",
  })
  const [newOrder, setNewOrder] = useState({
    asset_name: "",
    quantity: "",
    vendor_id: "",
  })
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await api.get("/purchase-orders")
      setOrders(res.data)
      setFilteredOrders(res.data)
    } catch (err) {
      console.error("Error fetching purchase orders:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch purchase orders
  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter logic
  useEffect(() => {
    let result = orders
    if (filters.status) {
      result = result.filter((order) => order.status === filters.status)
    }
    setFilteredOrders(result)
  }, [orders, filters])

  // Handle new order submission (for Supervisor only)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/purchase-orders", {
        ...newOrder,
        supervisor_id: user.id,
      })
      // Re-fetch to get complete data with joined names
      fetchOrders()
      setNewOrder({ asset_name: "", quantity: "", vendor_id: "" })
    } catch (err) {
      console.error("Error creating order:", err)
    }
  }

  // Update status (for Vendor or Admin)
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/purchase-orders/${id}`, { status, userId: user.id })
      const updatedOrders = orders.map((o) => (o.id === id ? res.data : o))
      setOrders(updatedOrders)
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Requested":
        return "#ffc107" // Warning
      case "Quoted":
        return "#17a2b8" // Info
      case "Approved":
        return "#28a745" // Success
      case "Rejected":
        return "#dc3545" // Danger
      case "Delivered":
        return "#6f42c1" // Purple
      default:
        return "#6c757d" // Grey
    }
  }

  if (loading) {
    return <div className="loading">Loading purchase orders...</div>
  }

  if (user?.role === "Supervisor" && !user?.room_id) {
    return (
      <div className="content">
        <div className="flex-center h-full">
           <div className="empty-state">
             <h3>Set your location first</h3>
             <p className="text-secondary">You need to be assigned to a room to view purchase orders.</p>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Purchase Orders</h2>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="Requested">Requested</option>
            <option value="Quoted">Quoted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Supervisor form */}
      {user?.role === "Supervisor" && (
        <div className="card mb-4" style={{ marginBottom: '2rem' }}>
          <h3 className="mb-4">Create New Order</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Asset Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Asset Name"
                value={newOrder.asset_name}
                onChange={(e) => setNewOrder({ ...newOrder, asset_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                className="form-input"
                type="number"
                placeholder="Quantity"
                value={newOrder.quantity}
                onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor ID</label>
              <input
                className="form-input"
                type="number"
                placeholder="Vendor ID"
                value={newOrder.vendor_id}
                onChange={(e) => setNewOrder({ ...newOrder, vendor_id: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Order</button>
          </form>
        </div>
      )}

      {/* List of Orders */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No purchase orders found</p>
        </div>
      ) : (
        <div className="table-container">
            <table className="table">
            <thead>
                <tr>
                <th>Asset</th>
                <th>Quantity</th>
                <th>Supervisor</th>
                <th>Vendor</th>
                <th>Quote</th>
                <th>Status</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredOrders.map((order) => (
                <tr key={order.id} id={`po-${order.id}`}>
                    <td>{order.asset_name}</td>
                    <td>{order.quantity}</td>
                    <td>{order.supervisor_name || order.supervisor_id}</td>
                    <td>{order.vendor_name || order.vendor_id}</td>
                    <td>{
                    order.quote ?
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-currency-rupee" viewBox="0 0 16 16">
                        <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z" />
                        </svg>
                        {order.quote}
                    </span>
                    :
                    "-"
                    }</td>
                    <td>
                    <span
                        style={{
                        color: getStatusColor(order.status),
                        fontWeight: "bold",
                        }}
                    >
                        {order.status}
                    </span>
                    </td>
                    <td>
                    <div className="flex gap-2">
                        {/* Vendor can submit quote */}
                        {user?.role === "Vendor" && order.status === "Requested" && (
                        <button onClick={() => updateStatus(order.id, "Quoted")} className="btn btn-secondary">
                            Submit Quote
                        </button>
                        )}

                        {/* Admin can approve/reject */}
                        {user?.role === "Super Admin" && order.status === "Quoted" && (
                        <>
                            <button onClick={() => updateStatus(order.id, "Approved")} className="btn btn-primary">Approve</button>
                            <button onClick={() => updateStatus(order.id, "Rejected")} className="btn btn-danger">Reject</button>
                        </>
                        )}

                        {/* Vendor can mark delivered */}
                        {user?.role === "Vendor" && order.status === "Approved" && (
                        <button onClick={() => updateStatus(order.id, "Delivered")} className="btn btn-primary">
                            Mark Delivered
                        </button>
                        )}
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  )
}
