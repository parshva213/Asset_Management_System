import { useState, useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import api from "../api"
import ThemeToggle from "../components/ThemeToggle"
import Footer from "../components/Footer"
import logo from "../img/logo.png"

const UpdatePassword = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    // Validation state
    const [validations, setValidations] = useState({
        password: null,
        confirm: null
    })

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email)
        } else {
            // If accessed directly without email, redirect to forgot password
            navigate("/reset-password")
        }
    }, [location, navigate])

    // Real-time validation
    useEffect(() => {
        setValidations({
            password: passwords.newPassword.length >= 6,
            confirm: passwords.newPassword.length >= 6 && passwords.newPassword === passwords.confirmPassword
        })
    }, [passwords])

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value })
    }

    const getInputClass = (fieldName) => {
        if (passwords[fieldName] === '') return 'form-input'
        if (fieldName === 'newPassword') return `form-input ${validations.password ? 'input-valid' : 'input-invalid'}`
        if (fieldName === 'confirmPassword') return `form-input ${validations.confirm ? 'input-valid' : 'input-invalid'}`
        return 'form-input'
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            // Using a new endpoint that accepts email + newPassword directly
            await api.post("/auth/reset-password-confirm", {
                email: email,
                newPassword: passwords.newPassword
            })

            setMessage("Password updated successfully! Redirecting to login...")
            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-wrapper">
             <div className="theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <div className="auth-card">
                 {/* AMS Logo */}
                 <img src={logo} alt="AMS Logo" className="auth-logo" style={{ width: '80px', height: 'auto', marginBottom: '1.5rem', display:'block', margin:'0 auto 1.5rem auto' }} />

                <h2 className="auth-title">Set New Password</h2>
                {/* Email display removed per user request */}

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group input-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className={getInputClass('newPassword')}
                            value={passwords.newPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="form-group input-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={getInputClass('confirmPassword')}
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>

                <div className="auth-link">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>

            <div className="auth-footer-wrapper">
                <Footer />
            </div>
        </div>
    )
}

export default UpdatePassword
