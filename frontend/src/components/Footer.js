import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            textAlign: 'center',
            padding: '1.25rem 1rem 1.25rem 1rem',
            marginTop: 'auto',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--panel)',
            width: '100%',
            flexShrink: 0
        }}>
            <p>&copy; {new Date().getFullYear()} Asset Management System. All rights reserved.</p>
            <p>Version 1.0.0</p>
        </footer>
    );
};

export default Footer;
