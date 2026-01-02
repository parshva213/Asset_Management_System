import React from 'react';

const Footer = ({ className, style }) => {
    return (
        <footer className={`site-footer ${className || ''}`} style={style}>
            <p>&copy; {new Date().getFullYear()} Asset Management System. All rights reserved.</p>
            <p>Version 1.0.0</p>
        </footer>
    );
};

export default Footer;
