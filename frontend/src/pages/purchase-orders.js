import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../api"

export default function PurchaseOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [newOrder, setNewOrder] = useState({
    asset_name: "",
    quantity: "",
    vendor_id: "",
  })

  // ✅ Fetch purchase orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/purchase-orders")
        setOrders(res.data)
      } catch (err) {
        console.error("Error fetching purchase orders:", err)
      }
    }
    fetchOrders()
  }, [])

  // ✅ Handle new order submission (for Supervisor only)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post("/purchase-orders", {
        ...newOrder,
        supervisor_id: user.id,
      })
      setOrders([...orders, res.data])
      setNewOrder({ asset_name: "", quantity: "", vendor_id: "" })
    } catch (err) {
      console.error("Error creating order:", err)
    }
  }

  // ✅ Update status (for Vendor or Admin)
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/purchase-orders/${id}`, { status, userId: user.id })
      setOrders(orders.map((o) => (o.id === id ? res.data : o)))
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }

  return (
    <div>
      <h2>Purchase Orders</h2>

      {/* Supervisor form */}
      {user?.role === "Supervisor" && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
          <h3>Create New Order</h3>
          <input
            type="text"
            placeholder="Asset Name"
            value={newOrder.asset_name}
            onChange={(e) => setNewOrder({ ...newOrder, asset_name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newOrder.quantity}
            onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Vendor ID"
            value={newOrder.vendor_id}
            onChange={(e) => setNewOrder({ ...newOrder, vendor_id: e.target.value })}
            required
          />
          <button type="submit">Submit Order</button>
        </form>
      )}

      {/* List of Orders */}
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Asset</th>
            <th>Quantity</th>
            <th>Supervisor</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Quote</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.asset_name}</td>
              <td>{order.quantity}</td>
              <td>{order.supervisor_id}</td>
              <td>{order.vendor_id}</td>
              <td>{order.status}</td>
              <td>{order.quote || "-"}</td>
              <td>
                {/* Vendor can submit quote */}
                {user?.role === "Vendor" && order.status === "Requested" && (
                  <button onClick={() => updateStatus(order.id, "Quoted")}>
                    Submit Quote
                  </button>
                )}

                {/* Admin can approve/reject */}
                {user?.role === "Super Admin" && order.status === "Quoted" && (
                  <>
                    <button onClick={() => updateStatus(order.id, "Approved")}>Approve</button>
                    <button onClick={() => updateStatus(order.id, "Rejected")}>Reject</button>
                  </>
                )}

                {/* Vendor can mark delivered */}
                {user?.role === "Vendor" && order.status === "Approved" && (
                  <button onClick={() => updateStatus(order.id, "Delivered")}>
                    Mark Delivered
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
