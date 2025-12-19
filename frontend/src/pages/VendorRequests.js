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
        const res = await api.get("/vendor/requests")
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
      <ul>
        {requests.map((req) => (
          <li key={req.id}>
            {req.request_type} - {req.status} (Asset: {req.asset_id})
          </li>
        ))}
      </ul>
    </div>
  )
}

export default VendorRequests
