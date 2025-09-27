import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isResetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        setMessage("Password reset email sent! Check your inbox.");
        setIsResetMode(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // TODOS van al mismo panel
        navigate('/panel');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // SVG recreation of the EasyTradelines logo
  const LogoSVG = () => (
    <svg width="120" height="60" viewBox="0 0 120 60" style={{ marginBottom: '16px' }}>
      {/* Chart bars */}
      <rect x="8" y="35" width="12" height="20" fill="#FF6B35" rx="2"/>
      <rect x="24" y="25" width="12" height="30" fill="#FFB800" rx="2"/>
      <rect x="40" y="15" width="12" height="40" fill="#7CB342" rx="2"/>
      
      {/* Growth arrow */}
      <path d="M45 8 L65 8 L60 3 M65 8 L60 13" 
            stroke="#2E7D32" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
      
      {/* Text - EASY */}
      <text x="75" y="25" 
            fill="#2E7D32" 
            fontSize="14" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif">EASY</text>
      
      {/* Text - TRADELINES */}
      <text x="75" y="42" 
            fill="#2E7D32" 
            fontSize="14" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif">TRADELINES</text>
    </svg>
  );

  // Función para determinar el título
  const getTitle = () => {
    if (isResetMode) return "Reset your password";
    return "Welcome back";
  };

  // Función para determinar el texto del botón
  const getButtonText = () => {
    if (loading) return "Processing...";
    if (isResetMode) return "Send Reset Email";
    return "Sign In to CRM";
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #2E7D32 50%, #7CB342 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header with Real Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <LogoSVG />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2E7D32',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Professional CRM Platform
          </h1>
          <p style={{
            color: '#6b7280',
            margin: '0 0 8px 0',
            fontSize: '16px'
          }}>
            {getTitle()}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#2E7D32',
            margin: '0',
            fontWeight: '500'
          }}>
            Tradeline Management System
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div style={{
            padding: '14px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '16px',
            backgroundColor: message.includes("sent") ? '#f0fdf4' : '#fef2f2',
            color: message.includes("sent") ? '#16a34a' : '#dc2626',
            border: `2px solid ${message.includes("sent") ? '#bbf7d0' : '#fecaca'}`,
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                backgroundColor: '#fafafa'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7CB342';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 179, 66, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#fafafa';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter your email"
            />
          </div>

          {/* Password field - solo mostrar si no está en modo reset */}
          {!isResetMode && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  backgroundColor: '#fafafa'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7CB342';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 179, 66, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#fafafa';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
          )}

          {/* Forgot Password Link - solo mostrar en modo login */}
          {!isResetMode && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2E7D32',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f0f9f0'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #7CB342 0%, #2E7D32 100%)',
              color: 'white',
              padding: '16px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              marginBottom: '20px',
              letterSpacing: '0.5px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                e.target.style.background = 'linear-gradient(135deg, #8BC34A 0%, #388E3C 100%)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'linear-gradient(135deg, #7CB342 0%, #2E7D32 100%)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></span>
                Processing...
              </span>
            ) : (
              getButtonText()
            )}
          </button>
        </form>

        {/* Navigation Links */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {isResetMode && (
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setMessage("");
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2E7D32',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'none',
                padding: '8px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f0f9f0'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ← Back to sign in
            </button>
          )}
        </div>

        {/* Admin Info */}
        <div style={{
          backgroundColor: '#f0f9f0',
          border: '2px solid #c8e6c9',
          borderRadius: '12px',
          padding: '14px',
          fontSize: '12px',
          color: '#2E7D32'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Admin Access</div>
          <div>Use josehefferan@gmail.com to access the administrative panel</div>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          fontSize: '11px',
          color: '#9ca3af'
        }}>
          Secured by enterprise-grade encryption
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
