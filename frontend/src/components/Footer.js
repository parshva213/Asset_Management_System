import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            textAlign: 'center',
            padding: '1rem',
            marginTop: 'auto',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--panel)'
        }}>
            <p>&copy; {new Date().getFullYear()} Asset Management System. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
