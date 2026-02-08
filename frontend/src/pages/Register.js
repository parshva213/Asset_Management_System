"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import api from "../api"
import ThemeToggle from "../components/ThemeToggle"
import Footer from "../components/Footer"
import logo from "../img/logo.png"

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [role, setRole] = useState("")
  const [locations, setLocations] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  // Validation States
  const [validations, setValidations] = useState({
      name: null,
      email: null,
      password: null,
      confirm: null,
      department: null,
      phone: null,
      location: null,
      room: null
  })

  useEffect(() => {
    // Get role from state or query param, otherwise redirect to role selection
    if (location.state?.role) {
      setRole(location.state.role)
    } else {
        // Fallback or redirect? Let's redirect if no role is found to ensure flow
       // However, maybe user just typed /register. Let's keep it but show a select or redirect.
       // For now, redirect to role-selection if no role.
       navigate('/role-selection')
    }
  }, [location, navigate])

  // Fetch locations when role is Supervisor and orgId is available
  useEffect(() => {
    if (role === "Supervisor" && location.state?.orgId) {
      const fetchLocations = async () => {
        try {
          const response = await api.get(`/auth/public/locations/${location.state.orgId}`)
          setLocations(response.data)
        } catch (error) {
          console.error("Error fetching locations:", error)
          setMessage("Failed to load locations")
        }
      }
      fetchLocations()
    }
  }, [role, location.state?.orgId])

  // Fetch rooms when a location is selected
  useEffect(() => {
    if (selectedLocation) {
      const fetchRooms = async () => {
        try {
          const response = await api.get(`/auth/public/rooms/${selectedLocation}`)
          setRooms(response.data)
          setSelectedRoom("") // Reset room selection when location changes
        } catch (error) {
          console.error("Error fetching rooms:", error)
          setMessage("Failed to load rooms")
        }
      }
      fetchRooms()
    } else {
      setRooms([])
      setSelectedRoom("")
    }
  }, [selectedLocation])

  // Real-time Validation Effect
  // Real-time Validation Effect
  useEffect(() => {
      setValidations({
          name: formData.name.trim().length >= 2,
          email: formData.email.includes('@') && formData.email.includes('.'),
          password: formData.password.length >= 6,
          confirm: formData.password === formData.confirmPassword,
          phone: formData.phone.length === 10,
          department:formData.department.trim().length >= 2,
          location: role === "Supervisor" ? selectedLocation !== "" : true,
          room: role === "Supervisor" ? selectedRoom !== "" : true
      })
  }, [formData, role, selectedLocation, selectedRoom])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match")
      return
    } else if (!validations.name || !validations.email || !validations.password || !validations.confirm || !validations.phone) {
      setMessage("Please fill all the fields correctly")
      return
    }
    
    // Additional validation for Supervisor role
    if (role === "Supervisor" && (!selectedLocation || !selectedRoom)) {
      setMessage("Please select both location and room")
      return
    }
    
    if (!formData.name || !formData.email || !formData.password || !formData.phone)
    setMessage("All fields are required");

    setLoading(true)
    setMessage("")

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role, // Role Name e.g. "Super Admin"
        department: formData.department || "",
        phone: formData.phone,
        orgId: location.state?.orgId,
        unpk: location.state?.regKey || "",
        loc_id: role === "Supervisor" ? selectedLocation : null,
        room_id: role === "Supervisor" ? selectedRoom : null
      })

      setMessage("Registration successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)
      setMessage(error.response?.data?.message || "Failed to register")
      setTimeout(() => {
        navigate("/role-selection")
      }, 1500);
    } finally {
      setLoading(false)
    }
  }

  const getInputClass = (fieldName) => {
      if (formData[fieldName] === '') return 'form-input'; // Initial state
      // Special case for confirm password, needs second field check
      if (fieldName === 'confirmPassword') {
          return `form-input ${validations.confirm ? 'input-valid' : formData.confirmPassword ? 'input-invalid' : ''}`
      }
      return `form-input ${validations[fieldName] ? 'input-valid' : 'input-invalid'}`
  }

  return (
    <div className="auth-wrapper">
      <div className="theme-toggle-wrapper">
          <ThemeToggle />
      </div>
      <div className="auth-card">
        {/* AMS Logo */}
        <img src={logo} alt="AMS Logo" className="auth-logo" />

        <h2 className="auth-title">Register as {role}</h2>
        {location.state?.orgName && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '-1rem' }}>
            Joining: <strong>{location.state.orgName}</strong>
          </p>
        )}

        {message && (
          <div className={`alert ${message.includes("successful") ? "alert-success" : "alert-error"}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group input-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className={getInputClass('name')}
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group input-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={getInputClass('email')}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group input-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={getInputClass('password')}
              value={formData.password}
              onChange={handleChange}
              minLength={6}
            />
          </div>

          <div className="form-group input-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className={getInputClass('confirmPassword')}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Optional fields based on role could go here, e.g. Department for Employees */}
          {['Employee', 'Supervisor', 'Maintenance Staff'].includes(role) && (
             <div className="form-group input-group">
                <label className="form-label">Department (Optional)</label>
                <input
                type="text"
                name="department"
                className="form-input" // Optional, no validation needed
                value={formData.department}
                onChange={handleChange}
                />
            </div>
          )}

          <div className="form-group input-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className={getInputClass('phone')}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              minLength={10}
              maxLength={10}
            />
          </div>

          {role === 'Vendor' && (
             <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                type="text"
                name="department" // Reusing department field for company name for vendors
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
                />
            </div>
          )}

          {/* Location Selection for Supervisor */}
          {role === 'Supervisor' && (
            <div className="form-group">
              <label className="form-label">Location</label>
              <select
                className={`form-input ${selectedLocation === '' ? '' : validations.location ? 'input-valid' : 'input-invalid'}`}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                required
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Room Selection for Supervisor - Only shows when location is selected */}
          {selectedLocation && (
            <div className="form-group">
              <label className="form-label">Room</label>
              <select
                className={`form-input ${selectedRoom === '' ? '' : validations.room ? 'input-valid' : 'input-invalid'}`}
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                required
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-link">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p> 
          <p className="mt-2">
             <Link to="/role-selection">Change Role</Link>
          </p>
        </div>
      </div>
      
       {/* Footer */}
       <div className="auth-footer-wrapper">
          <Footer />
       </div>
    </div>
  )
}

export default Register
