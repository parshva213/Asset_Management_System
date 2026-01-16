"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api"

import ThemeToggle from "../components/ThemeToggle"
import Footer from "../components/Footer"
import logo from "../img/logo.png"

const RoleSelection = () => {
  const navigate = useNavigate()
  const [unpk, setUnpk] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationData, setVerificationData] = useState(null) // { type, allowedRoles, orgId, orgName, referrerName }

  const handleRoleSelect = useCallback((roleName) => {
    navigate(`/register`, {
      state: {
        role: roleName,
        regKey: unpk,
        orgId: verificationData?.orgId,
        orgName: verificationData?.orgName
      }
    })
  }, [navigate, unpk, verificationData]);

  // Auto-navigate if only one role is available
  useEffect(() => {
    if (verificationData?.allowedRoles?.length === 1) {
      console.log("Auto-navigating for single role:", verificationData.allowedRoles[0]);
      handleRoleSelect(verificationData.allowedRoles[0]);
    }
  }, [verificationData, handleRoleSelect]);

  const handleVerifyKey = async (e) => {
    if (e) e.preventDefault()
    if (!unpk.trim()) return

    setLoading(true)
    setError("")
    try {
      const response = await api.post("/auth/verify-registration-key", { key: unpk })
      setVerificationData(response.data)
    } catch (err) {
      console.error("Verification failed:", err)
      setError(err?.message)
      setVerificationData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      <div className="role-selection-card">
        {/* AMS Logo */}
        <img src={logo} alt="AMS Logo" className="auth-logo" />
        <h2 className="auth-title">Registration</h2>

        {!verificationData ? (
          <form onSubmit={handleVerifyKey}>
            <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Please enter your registration key (UNPK) to proceed
            </p>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Enter Key"
                value={unpk}
                onChange={(e) => setUnpk(e.target.value)}
                maxLength={5}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px' }}
                required
              />
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : (
          <div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {verificationData.type === 'organization' ? (
                  <>Key verified for <strong>{verificationData.orgName}</strong></>
                ) : (
                  <>Key verified. Referred by <strong>{verificationData.referrerName}</strong></>
                )}
              </p>
              <h3 style={{ marginTop: '10px' }}>Select Your Role</h3>
              </div>
              {console.log(verificationData)}
              
            <div className="role-options">
              {verificationData.allowedRoles.map((roleName) => (
                <div key={roleName} className="role-option" onClick={() => handleRoleSelect(roleName)}>
                  <h3>{roleName}</h3>
                </div>
              ))}
            </div>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '20px' }}
              onClick={() => {
                setVerificationData(null)
                setUnpk("")
                setError("")
              }}
            >
              Back
            </button>
          </div>
        )}

        <div className="auth-link">
          {!verificationData && (
            <p style={{ marginBottom: '10px' }}>
              <Link to="/register" state={{ role: 'Vendor' }}>Register as Vendor</Link>
            </p>
          )}
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
      <div className="auth-footer-wrapper">
        <Footer />
      </div>
    </div>
  )
}

export default RoleSelection
