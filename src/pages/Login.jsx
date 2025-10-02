import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();

  const getConfig = () => {
    if (userType === 'broker') {
      return {
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        primaryColor: '#2563eb',
        hoverColor: '#1d4ed8',
        lightBg: '#eff6ff',
        borderColor: '#bfdbfe',
        title: 'Broker Login',
        subtitle: 'Access your broker dashboard'
      };
    } else if (userType === 'affiliate') {
      return {
        gradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #22c55e 100%)',
        primaryColor: '#16a34a',
        hoverColor: '#15803d',
        lightBg: '#f0fdf4',
        borderColor: '#bbf7d0',
        title: 'Cardholder Login',
        subtitle: 'Access your cardholder dashboard'
      };
    } else {
      return {
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2E7D32 50%, #7CB342 100%)',
        primaryColor: '#7CB342',
        hoverColor: '#689F38',
        lightBg: '#f0fdf4',
        borderColor: '#c8e6c9',
        title: 'Welcome back',
        subtitle: 'Professional CRM Platform'
      };
    }
  };

  const config = getConfig();

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
        
        if (error) {
          if (error.message.includes('Email not confirmed') || 
              error.message.includes('not confirmed')) {
            throw new Error('Your account is pending approval by EasyTradelines Admin. You will receive an email once approved.');
          }
          throw error;
        }

        if (userType === 'broker') {
          const { data: brokerData } = await supabase
            .from('brokers')
            .select('*')
            .eq('email', email)
            .single();

          if (!brokerData) {
            throw new Error('No broker account found with this email');
          }

          if (brokerData.status === 'pending') {
            await supabase.auth.signOut();
            throw new Error('Your account is pending approval by EasyTradelines Admin. You will receive an email once approved.');
          }

          if (brokerData.status === 'rejected') {
            await supabase.auth.signOut();
            throw new Error('Your broker application was not approved. Please contact support for more information.');
          }

          if (!brokerData.active) {
            await supabase.auth.signOut();
            throw new Error('Your account is currently inactive. Please contact EasyTradelines Admin.');
          }

        } else if (userType === 'affiliate') {
          const { data: affiliateData } = await supabase
            .from('affiliates')
            .select('*')
            .eq('email', email)
            .single();

          if (!affiliateData) {
            throw new Error('No cardholder account found with this email');
          }

          if (affiliateData.status === 'pending') {
            await supabase.auth.signOut();
            throw new Error('Your account is pending approval by EasyTradelines Admin. You will receive an email once approved.');
          }

          if (affiliateData.status === 'rejected') {
            await supabase.auth.signOut();
            throw new Error('Your cardholder application was not approved. Please contact support for more information.');
          }

          if (!affiliateData.active) {
            await supabase.auth.signOut();
            throw new Error('Your account is currently inactive. Please contact EasyTradelines Admin.');
          }
        }
        
        navigate('/panel');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const LogoSVG = () => (
    <svg width="120" height="60" viewBox="0 0 120 60" style={{ marginBottom: '16px' }}>
      <rect x="8" y="35" width="12" height="20" fill="#FF6B35" rx="2"/>
      <rect x="24" y="25" width="12" height="30" fill="#FFB800" rx="2"/>
      <rect x="40" y="15" width="12" height="40" fill="#7CB342" rx="2"/>
      <path d="M45 8 L65 8 L60 3 M65 8 L60 13" 
            stroke="#2E7D32" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
      <text x="75" y="25" 
            fill="#2E7D32" 
            fontSize="14" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif">EASY</text>
      <text x="75" y="42" 
            fill="#2E7D32" 
            fontSize="14" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif">TRADELINES</text>
    </svg>
  );

  const getButtonText = () => {
    if (loading) return "Processing...";
    if (isResetMode) return "Send Reset Email";
    return "Sign In to CRM";
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: config.gradient,
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <LogoSVG />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: config.primaryColor,
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            {config.title}
          </h1>
          <p style={{
            color: '#6b7280',
            margin: '0 0 8px 0',
            fontSize: '16px'
          }}>
            {config.subtitle}
          </p>
          <p style={{
            fontSize: '14px',
            color: config.primaryColor,
            margin: '0',
            fontWeight: '500'
          }}>
            Tradeline Management System
          </p>
        </div>

        {message && (
          <div style={{
            padding: '14px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '16px',
            backgroundColor: message.includes("sent") ? config.lightBg : '#fef2f2',
            color: message.includes("sent") ? config.primaryColor : '#dc2626',
            border: `2px solid ${message.includes("sent") ? config.borderColor : '#fecaca'}`,
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

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
              placeholder="Enter your email"
            />
          </div>

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
                placeholder="Enter your password"
                minLength={7}
              />
            </div>
          )}

          {!isResetMode && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: config.primaryColor,
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
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
              background: loading ? '#9ca3af' : `linear-gradient(135deg, ${config.primaryColor} 0%, ${config.hoverColor} 100%)`,
              color: 'white',
              padding: '16px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {getButtonText()}
          </button>
        </form>

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
                color: config.primaryColor,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              ← Back to sign in
            </button>
          )}
          
          {!isResetMode && userType && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Don't have an account?
              </p>
              <a 
                href={`/signup?type=${userType}`}
                style={{
                  color: config.primaryColor,
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Create Account
              </a>
            </div>
          )}
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          fontSize: '11px',
          color: '#9ca3af'
        }}>
          Secured by enterprise-grade encryption
        </div>
      </div>
    </div>
  );
}
