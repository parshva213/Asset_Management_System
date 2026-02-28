"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const { showSuccess, showError } = useToast()
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    department: "",
    phone: "",
    status: "Active",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        department: user.department || "",
        phone: user.phone || "",
        status: user.status || "Active",
      })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)

    const result = await updateProfile(profileData)
    if (result.success) {
      showSuccess(result.message)
    } else {
      showError(result.message)
    }
    setProfileLoading(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      showError("New password must be at least 6 characters long")
      return
    }

    setPasswordLoading(true)
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)

    if (result.success) {
      showSuccess(result.message)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } else {
      showError(result.message)
    }

    setPasswordLoading(false)
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
            <div className="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h3>Profile Information</h3>
          </div>
          <div className="card-body">
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
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={isReadOnly}
                  placeholder="Enter your phone number"
                />
              </div>
              {user.role !== "Vendor" && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={profileData.status}
                    onChange={handleProfileChange}
                    disabled={isReadOnly}
                  >
                    <option value="Active">On Work</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              )}
            </form>
          </div>
          <div className="card-footer">
            {!isReadOnly && (
                <button
                  type="submit"
                  className="btn btn-primary w-full mt-2"
                  disabled={profileLoading}
                >
                  {profileLoading ? "Updating..." : "Update Profile"}
                </button>
              )}
          </div>
        </div>

        {/* Change Password Card */}
        {!isReadOnly && (
          <div className="card password-card">
            <div className="card-header">
              <div className="card-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3>Change Password</h3>
            </div>
            <div className="card-body">
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
              </form>
            </div>
            <div className="card-footer">
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="btn btn-primary w-full"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
