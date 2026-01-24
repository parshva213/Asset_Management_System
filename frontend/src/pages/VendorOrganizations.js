"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useToast } from "../contexts/ToastContext"
import api from "../api"
import { formatDate } from "../utils/dateUtils"

const VendorOrganizations = () => {
    const { showError, showSuccess } = useToast()
    const [registeredOrganizations, setRegisteredOrganizations] = useState([])
    const [otherOrganizations, setOtherOrganizations] = useState([])
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState({})
    const [stats, setStats] = useState({
        totalOrganizations: 0,
        vendorOrganizationsCount: 0,
        otherOrganizationsCount: 0
    })
    const [activeTab, setActiveTab] = useState("registered")

    const fetchVendorOrganizations = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get("/organizations/vendor/list")
            setRegisteredOrganizations(response.data.registeredOrganizations || [])
            setOtherOrganizations(response.data.otherOrganizations || [])
            setStats({
                totalOrganizations: response.data.totalOrganizations || 0,
                vendorOrganizationsCount: response.data.vendorOrganizationsCount || 0,
                otherOrganizationsCount: response.data.otherOrganizationsCount || 0
            })
        } catch (err) {
            console.error("Error fetching vendor organizations:", err)
            showError("Failed to load organizations")
        } finally {
            setLoading(false)
        }
    }, [showError])

    useEffect(() => {
        fetchVendorOrganizations()
    }, [fetchVendorOrganizations])

    const handleRegisterOrganization = async (orgId, orgName) => {
        try {
            setRegistering(prev => ({ ...prev, [orgId]: true }))
            
            await api.post(`/organizations/vendor/register/${orgId}`)
            
            showSuccess(`Successfully registered with ${orgName}!`)
            
            // Update local state - move organization from other to registered
            const registeredOrg = otherOrganizations.find(org => org.id === orgId)
            if (registeredOrg) {
                setRegisteredOrganizations(prev => [...prev, registeredOrg])
                setOtherOrganizations(prev => prev.filter(org => org.id !== orgId))
                setStats(prev => ({
                    ...prev,
                    vendorOrganizationsCount: prev.vendorOrganizationsCount + 1,
                    otherOrganizationsCount: prev.otherOrganizationsCount - 1
                }))
            }
        } catch (err) {
            console.error("Error registering with organization:", err)
            showError(err?.data?.message || "Failed to register with organization")
        } finally {
            setRegistering(prev => ({ ...prev, [orgId]: false }))
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading organizations...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>📦 Organizations</h1>
                <p className="page-subtitle">View all organizations and your registered vendors</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-3">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "#10b981" }}>🏢</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Organizations</div>
                        <div className="stat-value">{stats.totalOrganizations}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "#3b82f6" }}>✓</div>
                    <div className="stat-content">
                        <div className="stat-label">Your Registered</div>
                        <div className="stat-value">{stats.vendorOrganizationsCount}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "#f59e0b" }}>📋</div>
                    <div className="stat-content">
                        <div className="stat-label">Other Organizations</div>
                        <div className="stat-value">{stats.otherOrganizationsCount}</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === "registered" ? "active" : ""}`}
                    onClick={() => setActiveTab("registered")}
                >
                    <span>✓ Your Organizations ({stats.vendorOrganizationsCount})</span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === "other" ? "active" : ""}`}
                    onClick={() => setActiveTab("other")}
                >
                    <span>📋 Other Organizations ({stats.otherOrganizationsCount})</span>
                </button>
            </div>

            {/* Registered Organizations Tab */}
            {activeTab === "registered" && (
                <div className="organizations-section">
                    <h2 className="section-title">Your Registered Organizations</h2>
                    {registeredOrganizations.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>No registered organizations yet</h3>
                            <p>You are not yet registered with any organizations. Switch to the "Other Organizations" tab to see available organizations.</p>
                        </div>
                    ) : (
                        <div className="organizations-grid">
                            {registeredOrganizations.map((org) => (
                                <div key={org.id} className="org-card registered">
                                    <div className="org-badge">✓ Registered</div>
                                    <div className="org-header">
                                        <h3 className="org-name">{org.name}</h3>
                                        <div className="org-key-badge">{org.v_opk}</div>
                                    </div>
                                    {org.description && (
                                        <p className="org-description">{org.description}</p>
                                    )}
                                    <div className="org-footer">
                                        <span className="org-date">📅 {formatDate(org.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Other Organizations Tab */}
            {activeTab === "other" && (
                <div className="organizations-section">
                    <h2 className="section-title">Other Organizations in System</h2>
                    <p className="section-subtitle">Total organizations registered: {stats.totalOrganizations}</p>
                    {otherOrganizations.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">✨</div>
                            <h3>All registered organizations are yours!</h3>
                            <p>Congratulations! You are registered with all available organizations in the system.</p>
                        </div>
                    ) : (
                        <div className="organizations-grid">
                            {otherOrganizations.map((org) => (
                                <div key={org.id} className="org-card other">
                                    <div className="org-badge-other">📋 Available</div>
                                    <div className="org-header">
                                        <h3 className="org-name">{org.name}</h3>
                                        <div className="org-key-badge-other">{org.v_opk}</div>
                                    </div>
                                    {org.description && (
                                        <p className="org-description">{org.description}</p>
                                    )}
                                    <div className="org-footer">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span className="org-date">📅 {formatDate(org.created_at)}</span>
                                            <button 
                                                className="register-btn"
                                                onClick={() => handleRegisterOrganization(org.id, org.name)}
                                                disabled={registering[org.id]}
                                            >
                                                {registering[org.id] ? "Registering..." : "Register"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .page-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                }

                .stats-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: var(--bg-secondary);
                    border-radius: 0.75rem;
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .stat-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .tab-navigation {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid var(--border-color);
                }

                .tab-btn {
                    padding: 0.75rem 1.5rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.3s ease;
                }

                .tab-btn:hover {
                    color: var(--text-primary);
                }

                .tab-btn.active {
                    color: var(--primary-color);
                }

                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--primary-color);
                }

                .organizations-section {
                    margin-bottom: 2rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .section-subtitle {
                    color: var(--text-secondary);
                    margin-bottom: 1.5rem;
                }

                .organizations-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .org-card {
                    padding: 1.5rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 0.75rem;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .org-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
                    border-color: var(--primary-color);
                }

                .org-card.registered {
                    border-left: 4px solid #10b981;
                }

                .org-card.other {
                    border-left: 4px solid #f59e0b;
                }

                .org-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    background: #10b981;
                    color: white;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                }

                .org-badge-other {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    background: #f59e0b;
                    color: white;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                }

                .org-header {
                    margin-bottom: 1rem;
                }

                .org-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .org-key-badge,
                .org-key-badge-other {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    font-family: 'Courier New', monospace;
                }

                .org-description {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }

                .org-footer {
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .org-date {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .register-btn {
                    padding: 0.5rem 1rem;
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .register-btn:hover:not(:disabled) {
                    background: #059669;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
                }

                .register-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .register-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .empty-state {
                    padding: 3rem 2rem;
                    text-align: center;
                    background: var(--bg-secondary);
                    border-radius: 0.75rem;
                    border: 2px dashed var(--border-color);
                }

                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .empty-state h3 {
                    font-size: 1.25rem;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .empty-state p {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }

                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--border-color);
                    border-top-color: var(--primary-color);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .page-container {
                        padding: 1rem;
                    }

                    .page-header h1 {
                        font-size: 1.5rem;
                    }

                    .stats-grid-3 {
                        grid-template-columns: 1fr;
                    }

                    .organizations-grid {
                        grid-template-columns: 1fr;
                    }

                    .tab-navigation {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    )
}

export default VendorOrganizations
