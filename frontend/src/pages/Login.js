import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ThemeToggle from "../components/ThemeToggle"
import Footer from "../components/Footer"

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
    <div className="auth-container" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <ThemeToggle />
      </div>
      <div className="auth-card">
        {/* AMS Logo in Circle */}
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(to right, #818cf8, #c7d2fe)',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
        }}>
            A
        </div>

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
              <label className="flex gap-2" style={{ alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Remember me</span>
              </label>
              
              <Link to="/reset-password" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot Password?
              </Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
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
      <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
         <Footer />
      </div>
    </div>
  )
}

export default Login
