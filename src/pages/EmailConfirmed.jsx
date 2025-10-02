import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function EmailConfirmed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = searchParams.get('type') || 'broker';
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/login?type=${userType}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, userType]);

  const getConfig = () => {
    if (userType === 'broker') {
      return {
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        primaryColor: '#2563eb'
      };
    } else {
      return {
        gradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #22c55e 100%)',
        primaryColor: '#16a34a'
      };
    }
  };

  const config = getConfig();

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
        padding: '60px 40px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#d1fae5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <CheckCircle style={{ 
            width: '48px', 
            height: '48px', 
            color: '#16a34a' 
          }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Email Confirmed Successfully!
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          Your email has been verified. Your account is now pending approval from our admin team. 
          You will receive a notification once your account is approved.
        </p>

        {/* Countdown */}
        <p style={{
          fontSize: '14px',
          color: '#9ca3af',
          marginBottom: '24px'
        }}>
          Redirecting to login in {countdown} seconds...
        </p>

        {/* Manual redirect button */}
        <button
          onClick={() => navigate(`/login?type=${userType}`)}
          style={{
            padding: '12px 32px',
            backgroundColor: config.primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
}
