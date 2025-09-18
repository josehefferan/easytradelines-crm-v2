import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MiCuenta() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setMe(profile);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    loadingContent: {
      textAlign: 'center'
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      borderRadius: '50%',
      height: '48px',
      width: '48px',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderBottomColor: '#2563eb',
      margin: '0 auto 16px auto'
    },
    loadingText: {
      color: '#6b7280'
    },
    header: {
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid #e5e7eb'
    },
    headerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 16px'
    },
    headerFlex: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 0'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center'
    },
    headerIcon: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '8px',
      borderRadius: '8px',
      marginRight: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    signOutButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    mainContent: {
      maxWidth: '768px',
      margin: '0 auto',
      padding: '24px 16px'
    },
    card: {
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '24px'
    },
    cardContent: {
      padding: '20px 24px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px 24px'
    },
    fieldGroup: {
      marginBottom: '0'
    },
    fieldLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '4px'
    },
    fieldValue: {
      fontSize: '14px',
      color: '#111827'
    },
    badge: {
      display: 'inline-flex',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '9999px'
    },
    adminBadge: {
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    },
    brokerBadge: {
      backgroundColor: '#eff6ff',
      color: '#2563eb'
    },
    affiliateBadge: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a'
    },
    defaultBadge: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    activeBadge: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a'
    },
    inactiveBadge: {
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    primaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '6px',
      color: 'white',
      backgroundColor: '#2563eb',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    secondaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '6px',
      color: '#374151',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    comingSoon: {
      textAlign: 'center',
      padding: '32px'
    },
    comingSoonIcon: {
      margin: '0 auto 8px auto',
      height: '48px',
      width: '48px',
      color: '#9ca3af'
    },
    comingSoonTitle: {
      marginTop: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#111827'
    },
    comingSoonText: {
      marginTop: '4px',
      fontSize: '14px',
      color: '#6b7280'
    }
  };

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerFlex}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIcon}>
                <svg style={{ width: '24px', height: '24px' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
              </div>
              <div>
                <h1 style={styles.headerTitle}>My Account</h1>
                <p style={styles.headerSubtitle}>EasyTradelines CRM v1.0</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={styles.signOutButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Profile Info */}
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Profile Information</h3>
            
            <div style={styles.grid}>
              <div style={styles.fieldGroup}>
                <div style={styles.fieldLabel}>User ID</div>
                <div style={{ ...styles.fieldValue, fontFamily: 'monospace' }}>{me?.unique_id}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.fieldLabel}>Role</div>
                <div style={styles.fieldValue}>
                  <span style={{
                    ...styles.badge,
                    ...(me?.role === 'admin' ? styles.adminBadge :
                        me?.role === 'broker' ? styles.brokerBadge :
                        me?.role === 'affiliate' ? styles.affiliateBadge :
                        styles.defaultBadge)
                  }}>
                    {me?.role?.charAt(0).toUpperCase() + me?.role?.slice(1)}
                  </span>
                </div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.fieldLabel}>Email</div>
                <div style={styles.fieldValue}>{me?.email}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.fieldLabel}>Status</div>
                <div style={styles.fieldValue}>
                  <span style={{
                    ...styles.badge,
                    ...(me?.is_active ? styles.activeBadge : styles.inactiveBadge)
                  }}>
                    {me?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {me?.first_name && (
                <div style={styles.fieldGroup}>
                  <div style={styles.fieldLabel}>First Name</div>
                  <div style={styles.fieldValue}>{me.first_name}</div>
                </div>
              )}
              
              {me?.last_name && (
                <div style={styles.fieldGroup}>
                  <div style={styles.fieldLabel}>Last Name</div>
                  <div style={styles.fieldValue}>{me.last_name}</div>
                </div>
              )}
              
              <div style={styles.fieldGroup}>
                <div style={styles.fieldLabel}>Member Since</div>
                <div style={styles.fieldValue}>
                  {new Date(me?.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Quick Actions</h3>
            
            <div style={styles.buttonGrid}>
              {me?.role === 'admin' && (
                <button
                  onClick={() => window.location.href = '/panel'}
                  style={styles.primaryButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                  }}
                >
                  <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Admin Panel
                </button>
              )}
              
              <button
                onClick={() => alert('Feature coming soon!')}
                style={styles.secondaryButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Role-specific content */}
        {me?.role !== 'admin' && (
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>
                {me?.role === 'broker' ? 'Broker Dashboard' : 
                 me?.role === 'affiliate' ? 'Affiliate Dashboard' : 'Client Dashboard'}
              </h3>
              
              <div style={styles.comingSoon}>
                <svg style={styles.comingSoonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 style={styles.comingSoonTitle}>Coming Soon</h3>
                <p style={styles.comingSoonText}>
                  {me?.role === 'broker' ? 'Client management and commission tracking features are being developed.' :
                   me?.role === 'affiliate' ? 'Tradeline management and commission tracking features are being developed.' :
                   'Your client portal features are being developed.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
