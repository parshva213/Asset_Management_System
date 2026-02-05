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
  const [profileMessage, setProfileMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

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
    setProfileLoading(true)
    setProfileMessage("")

    const result = await updateProfile(profileData)
    setProfileMessage(result.message)
    setProfileLoading(false)

    // Clear message after 3 seconds
    setTimeout(() => setProfileMessage(""), 3000)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match")
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters long")
      setPasswordLoading(false)
      return
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
    setPasswordMessage(result.message)

    if (result.success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }

    setPasswordLoading(false)

    // Clear message after 3 seconds
    setTimeout(() => setPasswordMessage(""), 3000)
  }

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const isReadOnly = profileData.name.includes('$')

  return (
    <div className="dashboard-layout profile-page">
      <div className="dashboard-grid profile-grid">
        {/* Profile Information Card */}
        <div className="card profile-card">
          <div className="card-header">
            <h3>Profile Information</h3>
          </div>
          <div className="card-body">
            {profileMessage && (
              <div className={`alert ${profileMessage.includes("success") ? "alert-success" : "alert-error"} mb-4`}>
                {profileMessage}
              </div>
            )}
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={profileData.name.replace('$', '')}
                  onChange={handleProfileChange}
                  required
                  disabled={isReadOnly}
                  placeholder="Enter your full name"
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
                  disabled={isReadOnly}
                  placeholder="Enter your email"
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
                  disabled={isReadOnly}
                  placeholder="Enter your department"
                />
              </div>
              {!isReadOnly && (
                <button
                  type="submit"
                  className="btn btn-primary w-full mt-2"
                  disabled={profileLoading}
                >
                  {profileLoading ? "Updating..." : "Update Profile"}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        {!isReadOnly && (
          <div className="card password-card">
            <div className="card-header">
              <h3>Change Password</h3>
            </div>
            <div className="card-body">
              {passwordMessage && (
                <div className={`alert ${passwordMessage.includes("success") ? "alert-success" : "alert-error"} mb-4`}>
                  {passwordMessage}
                </div>
              )}
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter current password"
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
                    placeholder="Enter new password"
                  />
                  <small className="text-secondary text-sm mt-1 block">
                    Password must be at least 6 characters long
                  </small>
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
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full mt-2"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
