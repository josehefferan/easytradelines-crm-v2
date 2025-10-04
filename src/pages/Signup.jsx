import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { User, Mail, Phone, Building, Globe, Lock, CheckCircle } from "lucide-react";

export default function Signup() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company_name: '',
    company_website: '',
    payment_method: 'paypal',
    payment_info: { account: '' }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const getConfig = () => {
    if (userType === 'broker') {
      return {
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        primaryColor: '#2563eb',
        hoverColor: '#1d4ed8',
        title: 'Broker Registration',
        subtitle: 'Create your broker account'
      };
    } else if (userType === 'affiliate') {
      return {
        gradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #22c55e 100%)',
        primaryColor: '#16a34a',
        hoverColor: '#15803d',
        title: 'Cardholder Registration',
        subtitle: 'Create your cardholder account'
      };
    } else {
      navigate('/login');
      return {};
    }
  };

  const config = getConfig();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 7) {
      newErrors.password = 'Password must be at least 7 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (userType === 'broker') {
      if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
      if (formData.company_website && !/^https?:\/\/.+\..+/.test(formData.company_website)) {
        newErrors.company_website = 'Please enter a valid website URL';
      }
    }

    if (userType === 'affiliate') {
      if (!formData.payment_method) newErrors.payment_method = 'Payment method is required';
      if (!formData.payment_info.account.trim()) newErrors.payment_info = 'Payment account is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setMessage('');

    try {
      const emailLower = formData.email.toLowerCase().trim();
      
      // 1. VERIFICAR SI EL EMAIL YA EXISTE
      const { data: existingUsers } = await supabase.rpc(
        'check_user_exists', 
        { user_email: emailLower }
      );

      let userId;
      let isExistingUser = false;

      if (existingUsers && existingUsers.length > 0) {
        // Usuario ya existe - verificar contraseña
        isExistingUser = true;
        userId = existingUsers[0].id;
        console.log('Existing user found:', userId);
        
        // Intentar login para validar contraseña
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password: formData.password
        });
        
        if (loginError) {
          throw new Error('This email is already registered. Please use your existing password or reset it from the login page.');
        }
        
      } else {
        // Usuario nuevo - crear en Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailLower,
          password: formData.password
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        userId = authData.user.id;
        console.log('New user created:', userId);

        // Login inmediato
        await supabase.auth.signInWithPassword({
          email: emailLower,
          password: formData.password
        });

        // Crear registro en tabla users
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: emailLower,
            role: userType,
            status: 'pending'
          });

        if (userError && userError.code !== '23505') {
          console.error('User table error:', userError);
        }
        
        console.log('User record created');
      }

      // 2. VERIFICAR SI YA EXISTE EN LA TABLA ESPECÍFICA
      if (userType === 'broker') {
 
        // Crear broker
        const { error: brokerError } = await supabase
          .from('brokers')
          .insert({
            user_id: userId,
            email: emailLower,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            phone: formData.phone.trim(),
            company_name: formData.company_name.trim(),
            company_website: formData.company_website.trim() || null,
            status: 'pending',
            registration_type: 'self_registered'
          });

        if (brokerError) throw brokerError;
        console.log('Broker created');
      }

        // Crear affiliate
        const { error: affiliateError } = await supabase
          .from('affiliates')
          .insert({
            user_id: userId,
            email: emailLower,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            phone: formData.phone.trim(),
            payment_method: formData.payment_method,
            payment_info: { account: formData.payment_info.account.trim() },
            status: 'pending_approval',
            registration_type: 'self_registered'
          });

        if (affiliateError) throw affiliateError;
        console.log('Affiliate created');
      }

      if (isExistingUser) {
        setMessage(`Account linked successfully! You can now access both your ${userType} panel and any other existing panels.`);
      }

      setSuccess(true);

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
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

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: config.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <CheckCircle style={{ width: '64px', height: '64px', color: '#16a34a', margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            Registration Completed!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '8px', lineHeight: '1.6' }}>
            Your account has been created successfully. You can now log in and start using the platform.
          </p>
          {message && (
            <p style={{ color: config.primaryColor, marginBottom: '24px', fontSize: '14px', fontWeight: '500' }}>
              {message}
            </p>
          )}
          <button
            onClick={() => navigate(`/login?type=${userType}`)}
            style={{
              padding: '12px 24px',
              backgroundColor: config.primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
        maxWidth: '600px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <LogoSVG />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: config.primaryColor,
            margin: '0 0 8px 0'
          }}>
            {config.title}
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {config.subtitle}
          </p>
        </div>

        {errors.submit && (
          <div style={{
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '2px solid #fecaca',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              Personal Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  <User size={16} /> First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `2px solid ${errors.first_name ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="John"
                />
                {errors.first_name && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.first_name}</span>}
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  <User size={16} /> Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `2px solid ${errors.last_name ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Doe"
                />
                {errors.last_name && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.last_name}</span>}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                <Mail size={16} /> Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="john@example.com"
              />
              {errors.email && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.email}</span>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                <Phone size={16} /> Phone <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `2px solid ${errors.phone ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="+1-555-0123"
              />
              {errors.phone && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.phone}</span>}
            </div>
          </div>

          {userType === 'broker' && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Company Information
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  <Building size={16} /> Company Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `2px solid ${errors.company_name ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Company Inc."
                />
                {errors.company_name && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.company_name}</span>}
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  <Globe size={16} /> Company Website <span style={{ color: '#9ca3af', fontSize: '12px' }}>(optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.company_website}
                  onChange={(e) => setFormData({...formData, company_website: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `2px solid ${errors.company_website ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://company.com"
                />
                {errors.company_website && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.company_website}</span>}
              </div>
            </div>
          )}

          {userType === 'affiliate' && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Payment Information
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Payment Method <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="paypal">PayPal</option>
                  <option value="zelle">Zelle</option>
                  <option value="venmo">Venmo</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Payment Account <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.payment_info.account}
                  onChange={(e) => setFormData({...formData, payment_info: { account: e.target.value }})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `2px solid ${errors.payment_info ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="your@paypal.com"
                />
                {errors.payment_info && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.payment_info}</span>}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              Account Security
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                <Lock size={16} /> Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `2px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter secure password"
                minLength={7}
              />
              {errors.password && <span style={{ fontSize: '12px', color: '#ef4444', display: 'block', marginTop: '4px' }}>{errors.password}</span>}
              
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>Password must contain:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px' }}>
                  <span style={{ color: formData.password.length >= 7 ? '#16a34a' : '#6b7280' }}>
                    {formData.password.length >= 7 ? '✓' : '○'} At least 7 characters
                  </span>
                  <span style={{ color: /[A-Z]/.test(formData.password) ? '#16a34a' : '#6b7280' }}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'} At least 1 uppercase letter
                  </span>
                  <span style={{ color: /[0-9]/.test(formData.password) ? '#16a34a' : '#6b7280' }}>
                    {/[0-9]/.test(formData.password) ? '✓' : '○'} At least 1 number
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                <Lock size={16} /> Confirm Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `2px solid ${errors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#9ca3af' : config.primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Already have an account? </span>
            <a 
              href={`/login?type=${userType}`}
              style={{ fontSize: '14px', color: config.primaryColor, fontWeight: '600', textDecoration: 'none' }}
            >
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
