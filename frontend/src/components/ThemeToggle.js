import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ style, className }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button 
            onClick={toggleTheme} 
            className={`btn btn-secondary ${className || ''}`}
            style={{ padding: '0.5rem', ...style }}
            title="Toggle Theme"
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
};

export default ThemeToggle;
