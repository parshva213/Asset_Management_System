import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ style, className }) => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleOpen = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (selectedTheme) => {
        setTheme(selectedTheme);
        setIsOpen(false);
    };

    const getIcon = (t) => {
        switch(t) {
            case 'light': return '☀️';
            case 'dark': return '🌙';
            case 'system': return '🖥️';
            default: return '🖥️';
        }
    };

    return (
        <div className={`theme-dropdown ${className || ''}`} style={{ position: 'relative', ...style }} ref={dropdownRef}>
            <button 
                onClick={toggleOpen} 
                className="btn btn-secondary"
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Select Theme"
            >
                {getIcon(theme)} <span style={{fontSize: '0.8rem'}}>▼</span>
            </button>
            
            {isOpen && (
                <div className="dropdown-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '5px',
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000,
                    minWidth: '140px',
                    overflow: 'hidden'
                }}>
                    {['light', 'dark', 'system'].map((t) => (
                        <div 
                            key={t}
                            onClick={() => handleSelect(t)}
                            style={{ 
                                padding: '10px 16px', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: theme === t ? 'var(--primary)' : 'transparent', 
                                color: theme === t ? 'white' : 'var(--text)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => { if(theme !== t) e.currentTarget.style.background = 'var(--bg-primary)'; }}
                            onMouseLeave={(e) => { if(theme !== t) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span style={{ fontSize: '1.1em' }}>
                                {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🖥️'}
                            </span>
                            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{t}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;
