import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

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
        
        // Verificar el rol del usuario y redirigir apropiadamente
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Verificar si es admin
          const { data: adminData } = await supabase
            .from('admin_emails')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (adminData) {
            // Es admin - ir al panel de admin
            navigate('/panel');
            return;
          }
          
          // Verificar si es broker activo
          const { data: brokerData } = await supabase
            .from('brokers')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (brokerData && brokerData.status === 'active') {
            // Es broker activo - ir al panel de broker
            navigate('/broker/panel');
            return;
          }
          
          // Por defecto, ir a Mi Cuenta
          navigate('/mi-cuenta');
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '1rem'
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '2rem'
    },
    logo: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#16a34a',
      margin: 0
    },
    tagline: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    },
    input: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.15s'
    },
    inputFocus: {
      borderColor: '#16a34a'
    },
    button: {
      padding: '0.75rem',
      backgroundColor: '#16a34a',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.15s'
    },
    buttonHover: {
      backgroundColor: '#15803d'
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    resetLink: {
      fontSize: '14px',
      color: '#16a34a',
      textAlign: 'center',
      marginTop: '1rem',
      cursor: 'pointer',
      textDecoration: 'none',
      border: 'none',
      background: 'none'
    },
    message: {
      padding: '0.75rem',
      borderRadius: '6px',
      fontSize: '14px',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#dc2626'
    },
    successMessage: {
      backgroundColor: '#dcfce7',
      color: '#16a34a'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <h1 style={styles.logoText}>EasyTradelines</h1>
          <p style={styles.tagline}>CRM System v1.0</p>
        </div>

        {message && (
          <div 
            style={{
              ...styles.message,
              ...(message.includes('sent') ? styles.successMessage : styles.errorMessage)
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your email"
              onFocus={(e) => e.target.style.borderColor = '#16a34a'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {!isResetMode && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter your password"
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#15803d')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#16a34a')}
          >
            {loading 
              ? 'Processing...' 
              : isResetMode 
                ? 'Send Reset Email' 
                : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setIsResetMode(!isResetMode)}
            style={styles.resetLink}
          >
            {isResetMode ? 'Back to Sign In' : 'Forgot Password?'}
          </button>
        </form>
      </div>
    </div>
  );
}
