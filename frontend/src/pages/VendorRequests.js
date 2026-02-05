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
    <div className="page-container">
      <div className="page-header">
        <h2>Replacement/Upgrade Requests</h2>
        <p>View and manage all replacement and upgrade requests from supervisors.</p>
      </div>
      
      <div className="user-grid">
        {requests.map((req) => (
          <div key={req.id} className="card user-card" id={`po-${req.id}`}>
            <div className="card-header flex-between">
                <h3 className="text-lg font-bold">{req.asset_name}</h3>
                <span className={`badge ${req.status === 'Completed' ? 'badge-high' : 'badge-medium'}`}>
                    {req.status}
                </span>
            </div>
            <div className="card-body">
                <p><strong>Quantity:</strong> {req.quantity}</p>
                <p><strong>Request Type:</strong> Replacement/Upgrade</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VendorRequests
