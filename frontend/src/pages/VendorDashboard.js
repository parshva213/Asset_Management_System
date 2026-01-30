"use client"
import { useEffect, useState, useCallback } from "react"
import api from "../api"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import { formatDate } from "../utils/dateUtils"

const VendorDashboard = () => {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({ 
      pending: 0, 
      completed: 0, 
      totalSupplied: 0,
      pendingOrders: [],
      completedOrders: []
  })

  /* Dashboard State */

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get("/vendor/dashboard")
      const data = response.data
      setStats({
        pending: data.pendingCount || 0,
        completed: data.completedCount || 0,
        totalSupplied: data.totalSupplied || 0,
        pendingOrders: data.pendingOrders || [],
        completedOrders: data.completedOrders || []
      })
    } catch (err) {
      if (err.response?.status === 403) {
        logout()
      } else {
        console.error(err)
      }
    }
  }, [logout])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="dashboard-layout vendor-dashboard">
        <style>{`
            .vendor-dashboard {
                padding: 2rem;
                max-width: 1400px;
            }
            .dashboard-top-row {
                display: grid;
                grid-template-columns: 350px 1fr;
                gap: 2rem;
                width: 100%;
                align-items: start;
            }
            
            /* Profile Card New Design */
            .profile-card-new {
                background: white;
                border-radius: 1.5rem;
                padding: 2rem;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            .profile-header-new {
                display: flex;
                align-items: center;
                gap: 1.5rem;
            }
            .avatar-circle {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: #6366f1;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.75rem;
                font-weight: 700;
                box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
                flex-shrink: 0;
            }
            .profile-greeting {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            .profile-greeting h3 {
                font-size: 1.5rem;
                font-weight: 800;
                color: #1e293b;
                margin: 0;
                line-height: 1.2;
            }
            .waving-hand {
                font-size: 1.5rem;
                display: block;
                margin-top: 0.25rem;
            }
            .role-badge-new {
                display: inline-block;
                margin-top: 0.5rem;
                padding: 0.25rem 0.75rem;
                background: #dcfce7;
                color: #10b981;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 700;
                width: fit-content;
            }
            .profile-details-new {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                padding-top: 1.5rem;
                border-top: 1px solid #f1f5f9;
            }
            .info-row {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: #475569;
                font-size: 0.95rem;
                font-weight: 500;
            }
            .info-icon {
                width: 20px;
                display: flex;
                justify-content: center;
            }
            .profile-footer-new {
                padding-top: 1rem;
                border-top: 1px solid #f1f5f9;
            }
            .profile-footer-new a {
                color: #6366f1;
                font-weight: 600;
                text-decoration: none;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            /* Stats Grid */
            .stats-grid-2 {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
            }
            .stat-widget-new {
                background: white;
                border-radius: 1.5rem;
                padding: 1.75rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                transition: all 0.2s;
            }
            .stat-widget-new:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
            }
            .stat-icon-new {
                width: 45px;
                height: 45px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                color: white;
                background: #6366f1;
            }
            .stat-icon-new.blue { background: #3b82f6; }
            .stat-icon-new.orange { background: #f59e0b; }
            .stat-icon-new.green { background: #10b981; }
            .stat-icon-new.purple { background: #8b5cf6; }
            .stat-icon-new.teal { background: #06b6d4; }
            .stat-icon-new.rose { background: #f43f5e; }
            
            .stat-label-new {
                color: #64748b;
                font-size: 0.9rem;
                font-weight: 500;
                display: block;
                margin-bottom: 0.25rem;
            }
            .stat-value-new {
                font-size: 2rem;
                font-weight: 800;
                color: #1e293b;
                margin: 0;
            }
            .stat-footer-new {
                margin-top: 0.5rem;
                padding-top: 1rem;
                border-top: 1px solid #f1f5f9;
            }
            .stat-footer-new a {
                color: #6366f1;
                font-weight: 600;
                text-decoration: none;
                font-size: 0.85rem;
            }

            @media (max-width: 1100px) {
                .dashboard-top-row {
                    grid-template-columns: 1fr;
                }
                .profile-card-new {
                    max-width: 100%;
                }
            }
            @media (max-width: 650px) {
                .stats-grid-2 {
                    grid-template-columns: 1fr;
                }
            }
        `}</style>

        <div className="dashboard-top-row">
            {/* Profile Card */}
            <div className="profile-card-new">
                <div className="profile-header-new">
                    <div className="avatar-circle">
                        {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "V"}
                    </div>
                    <div className="profile-greeting">
                        <h3>Hi, {user?.name || "Vendor"}</h3>
                        <span className="waving-hand">👋</span>
                        <span className="role-badge-new">Vendor</span>
                    </div>
                </div>
                <div className="profile-details-new">
                    <div className="info-row">
                        <span className="info-icon">📧</span> {user?.email}
                    </div>
                    <div className="info-row">
                        <span className="info-icon">📞</span> {user?.phone || "Not set"}
                    </div>
                    <div className="info-row">
                        <span className="info-icon">🛡️</span> {user?.role} - {user?.department || "External Vendor"}
                    </div>

                </div>
                <div className="profile-footer-new">
                    <Link to="/profile">Update Profile →</Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-2">
                <div className="stat-widget-new">
                    <div>
                        <div className="stat-icon-new orange">
                            📦
                        </div>
                        <span className="stat-label-new">Pending Orders</span>
                        <h3 className="stat-value-new">{stats.pending >= 10 ? `${Math.floor(stats.pending / 10) * 10}+` : stats.pending}</h3>
                    </div>
                    <div className="stat-footer-new">
                         <Link to="/vendor-requests">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget-new">
                    <div>
                        <div className="stat-icon-new green">
                            ✅
                        </div>
                        <span className="stat-label-new">Completed Orders</span>
                        <h3 className="stat-value-new">{stats.completed >= 10 ? `${Math.floor(stats.completed / 10) * 10}+` : stats.completed}</h3>
                    </div>
                    <div className="stat-footer-new">
                         <Link to="/vendor-requests">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget-new">
                    <div>
                        <div className="stat-icon-new blue">
                            🚚
                        </div>
                        <span className="stat-label-new">Total Supplied</span>
                        <h3 className="stat-value-new">{stats.totalSupplied >= 10 ? `${Math.floor(stats.totalSupplied / 10) * 10}+` : stats.totalSupplied}</h3>
                    </div>
                    <div className="stat-footer-new">
                         <Link to="/vendor-assets">
                            View full details →
                        </Link>
                    </div>
                </div>
                <div className="stat-widget-new">
                    <div>
                        <div className="stat-icon-new teal">
                            🆕
                        </div>
                        <span className="stat-label-new">Supply Assets</span>
                         <h3 className="stat-value-new">
                            <span style={{fontSize: '1rem', fontWeight: '500'}}>New Item</span>
                        </h3>
                    </div>
                    <div className="stat-footer-new">
                         <Link to="/supply-assets">
                            Supply New →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>

  )
}

export default VendorDashboard
