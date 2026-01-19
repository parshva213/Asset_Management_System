import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import api from '../api';
import logo from "../img/logo.png";

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Validation State
    const [isValidEmail, setIsValidEmail] = useState(null)

    // Validate email on change
    const handleEmailChange = (e) => {
        const val = e.target.value
        setEmail(val)
        if (val) {
            setIsValidEmail(val.includes('@') && val.includes('.'))
        } else {
            setIsValidEmail(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Verify email exists
            const res = await api.post('/auth/forgot-password', { email });
            
            // If successful (no internal error thrown), redirect to update password page
            if (res.status === 200) {
                 navigate('/update-password', { state: { email } });
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('Email not found');
            } else {
                setError('Failed to send reset link. Please try again.');
            }
        }
    };

    return (
        <div className="auth-container" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <ThemeToggle />
            </div>
            
            <div className="auth-card" style={{textAlign: 'center'}}>
                {/* AMS Logo */}
                <img src={logo} alt="AMS Logo" className="auth-logo" style={{ width: '80px', height: 'auto', marginBottom: '1.5rem' }} />
                
                <h2 className="auth-title">Simple Reset Your Password</h2>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className={`form-input ${isValidEmail === true ? 'input-valid' : isValidEmail === false ? 'input-invalid' : ''}`}
                            value={email}
                            onChange={handleEmailChange}
                            required
                            placeholder="Enter your registered email"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Verify Your Email
                    </button>
                </form>

                <div className="auth-link">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <Footer />
            </div>
        </div>
    );
};

export default ResetPassword;
