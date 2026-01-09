"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    department: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        department: user.department || "",
      })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const result = await updateProfile(profileData)
    setMessage(result.message)
    setLoading(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match")
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long")
      setLoading(false)
      return
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
    setMessage(result.message)

    if (result.success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }

    setLoading(false)
  }

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  return (
    <div className="dashboard-layout">
        <h2 style={{ marginBottom: "5px" }}>Profile Management</h2>
        
        {message && (
            <div className={`alert ${message.includes("success") ? "alert-success" : "alert-error"}`} style={{marginBottom: '10px'}}>
                {message}
            </div>
        )}
        <div className="dashboard-grid" style={{ margin: '0' }}>
            {/* Profile Information Card */}
            <div className="card">
                <h3>Profile Information</h3>
                <form onSubmit={handleProfileSubmit} style={{ marginTop: '0.4rem' }}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={profileData.name.replace('$', '')}
                            onChange={handleProfileChange}
                            required
                            disabled={profileData.name.includes('$')}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                            disabled={profileData.name.includes('$')}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Department</label>
                        <input
                            type="text"
                            name="department"
                            className="form-input"
                            value={profileData.department}
                            onChange={handleProfileChange}
                            disabled={profileData.name.includes('$')}
                        />
                    </div>
                    {!profileData.name.includes('$') && (
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? "Updating..." : "Update Profile"}
                        </button>
                    )}
                </form>
            </div>

            {/* Change Password Card */}
            {!profileData.name.includes('$') && (
                <div className="card">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} style={{ marginTop: '0.4rem' }}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                className="form-input"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                className="form-input"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                            <small style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Password must be at least 6 characters long</small>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? "Changing..." : "Change Password"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    </div>
  )
}

export default Profile
