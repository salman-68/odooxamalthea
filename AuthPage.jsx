// src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const REST_COUNTRIES_API = 'https://restcountries.com/v3.1/all?fields=name,currencies';

// --- Helper Component for Form Content with Animation ---
const AnimatedForm = ({ children, isVisible }) => {
    // We use maxHeight and opacity for a smooth transition that respects variable form heights
    const visibilityStyle = {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        maxHeight: isVisible ? '600px' : '0', // Ensures the form wrapper expands correctly
        padding: isVisible ? '10px 0' : '0 0',
        pointerEvents: isVisible ? 'auto' : 'none',
    };

    return (
        <div 
            style={{
                ...styles.animatedContainer,
                ...visibilityStyle,
            }}
        >
            {children}
        </div>
    );
};


// --- 1. FULL Registration/Setup Form Component (Creates Admin & Company) ---
const SetupForm = ({ onSetupSuccess, isVisible }) => {
    const [formData, setFormData] = useState({
        adminName: '',
        adminEmail: '',
        password: '',
        confirmPassword: '',
        countryCode: '',
        baseCurrency: ''
    });
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Fetch Country and Currency Data on mount
    useEffect(() => {
        const fetchCountries = async () => {
            setLoading(true);
            try {
                const response = await fetch(REST_COUNTRIES_API);
                if (!response.ok) throw new Error('Failed to fetch country data');
                const data = await response.json();
                
                const processedCountries = data
                    .map(country => {
                        const currencyCode = country.currencies && Object.keys(country.currencies).length > 0
                            ? Object.keys(country.currencies)[0] 
                            : null;
                        
                        if (!currencyCode) return null;
                        
                        return {
                            name: country.name.common,
                            currencyCode: currencyCode,
                            countryCode: country.cca2
                        };
                    })
                    .filter(c => c !== null)
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCountries(processedCountries);
            } catch (err) {
                setApiError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCountries();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'countryCode') {
            const selectedCountry = countries.find(c => c.countryCode === value);
            setFormData(prev => ({
                ...prev,
                countryCode: value,
                baseCurrency: selectedCountry ? selectedCountry.currencyCode : ''
            }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (!formData.countryCode) {
            alert("Please select your company's country.");
            return;
        }

        setLoading(true);
        setApiError(null);
        
        // MOCK: Simulate API call for Admin/Company creation (replace with actual backend call)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onSetupSuccess(); 
        setLoading(false);
    };
    
    // Show loading/error state for the form
    if (apiError) return <p style={{color: 'red', textAlign: 'center'}}>Error fetching countries: {apiError}</p>;
    if (loading && countries.length === 0) return <p style={{textAlign: 'center'}}>Loading countries...</p>;


    return (
        <AnimatedForm isVisible={isVisible}>
            <div style={styles.formContent}>
                <h3 style={styles.formHeader}>🚀 Register: System Setup (Admin)</h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* Input Fields */}
                    <input type="text" style={styles.inputField} placeholder="Admin Full Name" name="adminName" value={formData.adminName} onChange={handleChange} required />
                    <input type="email" style={styles.inputField} placeholder="Admin Email (Login ID)" name="adminEmail" value={formData.adminEmail} onChange={handleChange} required />
                    <input type="password" style={styles.inputField} placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
                    <input type="password" style={styles.inputField} placeholder="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

                    {/* Country Selection */}
                    <select style={styles.inputField} name="countryCode" value={formData.countryCode} onChange={handleChange} required>
                        <option value="">-- Select Country (Sets Base Currency) --</option>
                        {countries.map(country => (
                            <option key={country.countryCode} value={country.countryCode}>
                                {country.name} ({country.currencyCode})
                            </option>
                        ))}
                    </select>

                    <p style={styles.currencyDisplay}>Base Currency: <span style={{fontWeight: 'bold'}}>{formData.baseCurrency || '---'}</span></p>

                    <button type="submit" style={styles.buttonSetup} disabled={loading}>
                        {loading ? 'Setting Up...' : 'Create System & Register'}
                    </button>
                </form>
            </div>
        </AnimatedForm>
    );
};

// --- 2. Login Form Component (Standard User Login) ---
const LoginForm = ({ onLoginSuccess, isVisible }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // MOCK: Simulate API call for user login
        await new Promise(resolve => setTimeout(resolve, 1000));
        onLoginSuccess();
        setLoading(false);
    };

    return (
        <AnimatedForm isVisible={isVisible}>
            <div style={styles.formContent}>
                <h3 style={styles.formHeader}>🔒 Employee / Manager Login</h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input type="email" style={styles.inputField} placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" style={styles.inputField} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" style={styles.buttonLogin} disabled={loading}>
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>
            </div>
        </AnimatedForm>
    );
};


// --- Main Unified Auth Page Component ---

function AuthPage() {
    // Controls which form is visible ('setup' or 'login')
    const [mode, setMode] = useState('setup'); 
    const navigate = useNavigate();

    const handleSuccess = () => {
        // Upon successful registration (setup) or login, navigate to the dashboard
        navigate('/admin/dashboard'); 
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.toggleBar}>
                {/* Visual Slider/Toggle */}
                <div 
                    style={{
                        ...styles.slider,
                        transform: `translateX(${mode === 'login' ? '100%' : '0%'})`
                    }}
                />

                {/* Toggle Button for Setup (Label) */}
                <button
                    onClick={() => setMode('setup')}
                    style={{...styles.toggleButton, color: mode === 'setup' ? 'white' : 'black'}}
                >
                    Register / Setup
                </button>
                
                {/* Toggle Button for Login (Label) */}
                <button
                    onClick={() => setMode('login')}
                    style={{...styles.toggleButton, color: mode === 'login' ? 'white' : 'black'}}
                >
                    Login
                </button>
            </div>

            <div style={styles.formWrapper}>
                {/* Render both forms but control visibility/animation via the `isVisible` prop */}
                <SetupForm 
                    onSetupSuccess={handleSuccess} 
                    isVisible={mode === 'setup'}
                />
                <LoginForm 
                    onLoginSuccess={handleSuccess} 
                    isVisible={mode === 'login'}
                />
            </div>
        </div>
    );
}


// --- FIXED AND ENHANCED STYLES ---
const styles = {
    pageContainer: {
        maxWidth: '400px', 
        margin: '80px auto', 
        padding: '35px', 
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
        fontFamily: 'Arial, sans-serif'
    },
    toggleBar: {
        display: 'flex',
        position: 'relative',
        marginBottom: '30px',
        backgroundColor: '#f0f0f0',
        borderRadius: '50px',
        padding: '5px',
        overflow: 'hidden',
    },
    slider: {
        position: 'absolute',
        top: '5px',
        left: '5px',
        width: 'calc(50% - 5px)', 
        height: 'calc(100% - 10px)', 
        backgroundColor: '#007bff',
        borderRadius: '50px',
        transition: 'transform 0.4s ease-in-out',
        zIndex: 1,
    },
    toggleButton: {
        flex: 1,
        padding: '12px 0',
        fontSize: '15px',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        zIndex: 2, 
        transition: 'color 0.4s ease-in-out',
    },
    formWrapper: {
        minHeight: '400px', 
    },
    animatedContainer: {
        // Max-height animation for smooth form switching based on content size
        width: '100%',
        transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, max-height 0.5s ease-in-out, padding 0.5s ease-in-out',
        overflow: 'hidden',
        // Critical: Set the starting height for hidden state
        boxSizing: 'border-box',
    },
    formContent: {
        textAlign: 'center',
        padding: '10px 0'
    },
    formHeader: {
        color: '#333',
        marginBottom: '25px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px', 
    },
    inputField: {
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '16px',
        transition: 'border-color 0.3s',
        width: '100%', 
        boxSizing: 'border-box', // Ensures padding is inside the 100% width
    },
    currencyDisplay: {
        textAlign: 'left',
        fontSize: '0.9em',
        color: '#666',
        marginTop: '-10px',
    },
    buttonSetup: {
        padding: '12px', 
        backgroundColor: '#007bff', 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    },
    buttonLogin: {
        padding: '12px', 
        backgroundColor: '#28a745', 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    }
};

export default AuthPage;