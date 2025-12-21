import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('If an account exists for ' + email + ', you will receive a reset link.');
    };

    return (
        <div className="auth-container" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <ThemeToggle />
            </div>
            
            <div className="auth-card" style={{textAlign: 'center'}}>
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
                
                <h2 className="auth-title">Simple Reset Your Password</h2>

                {message && <div className="alert alert-success">{message}</div>}

                <form onSubmit={handleSubmit} style={{textAlign: 'left'}}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your registered email"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Send Reset Link
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
