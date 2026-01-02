import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ThemeToggle from "../components/ThemeToggle"
import Footer from "../components/Footer"
import logo from "../img/logo.png"

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  // Real-time validation state
  const [isValidEmail, setIsValidEmail] = useState(null) // null, true, false
  const [isValidPassword, setIsValidPassword] = useState(null)

  useEffect(() => {
    if (formData.email) {
      setIsValidEmail(formData.email.includes('@') && formData.email.includes('.'))
    } else {
      setIsValidEmail(null)
    }
    
    if (formData.password) {
      setIsValidPassword(formData.password.length > 0)
    } else {
      setIsValidPassword(null)
    }
  }, [formData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const result = await login(formData.email, formData.password, rememberMe)

    if (result.success) {
      navigate(result.redirectPath || "/dashboard")
    } else {
      setMessage(result.message)
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="auth-wrapper">
      <div className="theme-toggle-wrapper">
          <ThemeToggle />
      </div>
      <div className="auth-card">
        {/* AMS Logo */}
        <img src={logo} alt="AMS Logo" className="auth-logo" />

        <h2 className="auth-title">Login</h2>

        {message && (
          <div className={`alert ${message.includes("success") ? "alert-success" : "alert-error"}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group input-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-input ${isValidEmail === true ? 'input-valid' : isValidEmail === false ? 'input-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group input-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-input ${isValidPassword === true ? 'input-valid' : isValidPassword === false ? 'input-invalid' : ''}`}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex-between mb-4">
              <label className="remember-me-label">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                  />
                  <span>Remember me</span>
              </label>
              
              <Link to="/reset-password" className="forgot-password-link">
                  Forgot Password?
              </Link>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-link">
          <p>
            Don't have an account? <Link to="/role-selection">Register here</Link>
          </p>
        </div>
      </div>
      
      {/* Footer for Login Page */}
      <div className="auth-footer-wrapper">
         <Footer />
      </div>
    </div>
  )
}

export default Login
