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
  const [step, setStep] = useState(1) // 1: Info, 2: Room selection (for IT Supervisor)
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
      phone: null
  })

  useEffect(() => {
    const orgId = location.state?.orgId
    // Get role from state or query param
    if (location.state?.role) {
      setRole(location.state.role)
    } else {
       navigate('/role-selection')
    }

    // Fetch locations for registration, filtered by orgId if available
    const fetchLocations = async () => {
        try {
            const res = await api.get(`/public/locations${orgId ? `?org_id=${orgId}` : ''}`)
            setLocations(res.data)
        } catch (error) {
            console.error("Error fetching locations:", error)
        }
    }
    fetchLocations()
  }, [location, navigate])

  const fetchRoomsForLocation = async (locId) => {
      try {
          const res = await api.get(`/public/rooms/${locId}`)
          setRooms(res.data)
      } catch (error) {
          console.error("Error fetching rooms:", error)
      }
  }

  // Real-time Validation Effect
  useEffect(() => {
      setValidations({
          name: formData.name.trim().length >= 2,
          email: formData.email.includes('@') && formData.email.includes('.'),
          password: formData.password.length >= 6,
          confirm: formData.password === formData.confirmPassword,
          phone: formData.phone.length === 10,
          department:formData.department.trim().length >= 2
      })
  }, [formData, role])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Step 1 Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match")
      return
    } else if (!validations.name || !validations.email || !validations.password || !validations.confirm || !validations.phone) {
      setMessage("Please fill all the fields correctly")
      return
    }

    // IT Supervisor Specific Step Logic
    if (role === 'IT Supervisor' && step === 1) {
        if (!selectedLocation) {
            setMessage("Please select a location")
            return
        }
        setLoading(true)
        await fetchRoomsForLocation(selectedLocation)
        setStep(2)
        setLoading(false)
        setMessage("")
        return
    }

    // Final Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        setMessage("All fields are required");
        return
    }

    if (role === 'IT Supervisor' && !selectedRoom) {
        setMessage("Please select a room")
        return
    }

    setLoading(true)
    setMessage("")

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        department: formData.department || "",
        phone: formData.phone,
        orgId: location.state?.orgId,
        unpk: location.state?.regKey || "",
        room_id: selectedRoom || null
      })

      setMessage("Registration successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)
      setMessage(error.response?.data?.message || "Failed to register")
      // If error, maybe go back to step 1 if IT Supervisor?
    } finally {
      setLoading(false)
    }
  }

  const getInputClass = (fieldName) => {
      if (formData[fieldName] === '') return 'form-input'; 
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
          {step === 1 ? (
              <>
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

                {['Employee', 'Supervisor', 'Maintenance Staff', 'IT Supervisor'].includes(role) && (
                    <div className="form-group input-group">
                        <label className="form-label">Department (Optional)</label>
                        <input
                        type="text"
                        name="department"
                        className="form-input"
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
                    <div className="form-group input-group">
                        <label className="form-label">Company Name</label>
                        <input
                        type="text"
                        name="department" 
                        className="form-input"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Enter your company name"
                        required
                        />
                    </div>
                )}

                {role === 'IT Supervisor' && (
                    <div className="form-group input-group">
                        <label className="form-label">Location</label>
                        <select
                            className="form-input"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            required
                        >
                            <option value="">Select Location</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: '1rem' }} disabled={loading}>
                    {role === 'IT Supervisor' ? "Next" : (loading ? "Registering..." : "Register")}
                </button>
              </>
          ) : (
              /* Step 2: Room Selection for IT Supervisor */
              <>
                 <div className="form-group input-group">
                    <label className="form-label">Select Room</label>
                    <select
                        className="form-input"
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        required
                    >
                        <option value="">Select Room</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ flex: 1 }} 
                        disabled={loading}
                        onClick={() => setStep(1)}
                    >
                        Back
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ flex: 2 }} 
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Complete Registration"}
                    </button>
                </div>
              </>
          )}
        </form>

        <div className="auth-link">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p> 
          <p style={{ marginTop: '0.5rem' }}>
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
