"use client"
import { useEffect, useState } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"

const VendorRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/purchase-orders")
        setRequests(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchRequests()
  }, [user])

  return (
    <div>
      <h2>Replacement/Upgrade Requests</h2>
      <ul className="request-list">
        {requests.map((req) => (
          <li key={req.id} className="card mb-2" id={`po-${req.id}`}>
            {req.asset_name} (Qty: {req.quantity}) - <span className={`badge badge-${req.status === 'Completed' ? 'high' : 'medium'}`}>{req.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default VendorRequests
