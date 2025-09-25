import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Importar componentes
import LoginPage from './pages/Login';
import AdminPanel from './pages/Panel'; // Tu panel actual
import BrokerPanel from './pages/BrokerPanel';

const App = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Detectar cambios en la URL
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Verificar sesión actual
    checkUser();

    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        navigateTo('/login');
      }
    });

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Verificar usuario actual
  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  // Obtener perfil del usuario para determinar rol y estado
  const fetchUserProfile = async (authUser) => {
    try {
      setUser(authUser);
      
      // Determinar si es admin o broker basado en el email o tabla
      let profile = null;
      let role = null;

      // Verificar si es admin (puedes usar email específico o tabla admins)
      if (authUser.email === 'josehefferan@gmail.com' || authUser.email.includes('@easytradelines.com')) {
        profile = {
          id: authUser.id,
          email: authUser.email,
          name: 'Jose Hefferan', // O extraer del auth user
          role: 'admin',
          status: 'active'
        };
      } else {
        // Buscar en tabla brokers
        const { data: brokerData, error } = await supabase
          .from('brokers')
          .select('*')
          .eq('email', authUser.email)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (brokerData) {
          profile = {
            ...brokerData,
            role: 'broker'
          };
        }
      }

      setUserProfile(profile);
      
      // Redireccionar según el estado del usuario
      if (profile) {
        redirectBasedOnRole(profile);
      } else {
        // Usuario no encontrado en sistema
        await supabase.auth.signOut();
        navigateTo('/login?error=unauthorized');
      }
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  // Redireccionar basado en rol y estado
  const redirectBasedOnRole = (profile) => {
    const currentPath = window.location.pathname;
    
    if (profile.role === 'admin') {
      if (currentPath !== '/admin' && currentPath !== '/') {
        navigateTo('/admin');
      }
    } else if (profile.role === 'broker') {
      if (profile.status === 'active') {
        if (currentPath !== '/broker/panel' && currentPath !== '/') {
          navigateTo('/broker/panel');
        }
      } else {
        // Broker no activo - mostrar página de espera
        if (currentPath !== '/broker/pending') {
          navigateTo('/broker/pending');
        }
      }
    }
  };

  // Función para navegar (simple SPA routing)
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Componente de loading
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', margin: 0 }}>Loading...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Componente para broker pendiente
  const BrokerPendingPage = () => (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#fef3c7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <svg width="40" height="40" fill="#f59e0b" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 style={{ color: '#1f2937', margin: '0 0 12px 0', fontSize: '24px' }}>
          Account Under Review
        </h2>
        <p style={{ color: '#6b7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
          Your broker account ({userProfile?.custom_id}) is being reviewed by our admin team. 
          You'll receive access to your broker panel once approved.
        </p>
        <div style={{ 
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{ color: '#166534', margin: 0, fontSize: '14px' }}>
            <strong>Current Status:</strong> {userProfile?.status || 'Registered'}
          </p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  // Router logic
  const renderCurrentPage = () => {
    // Si no hay usuario, mostrar login
    if (!user || !userProfile) {
      return <LoginPage onNavigate={navigateTo} />;
    }

    // Routing basado en path y permisos
    switch (currentPath) {
      case '/':
        // Redirect a la página apropiada
        if (userProfile.role === 'admin') {
          navigateTo('/admin');
          return null;
        } else if (userProfile.role === 'broker' && userProfile.status === 'active') {
          navigateTo('/broker/panel');
          return null;
        } else {
          navigateTo('/broker/pending');
          return null;
        }

      case '/admin':
        if (userProfile.role === 'admin') {
          return <AdminPanel currentUser={userProfile} onNavigate={navigateTo} />;
        } else {
          navigateTo('/broker/panel');
          return null;
        }

      case '/broker/panel':
        if (userProfile.role === 'broker' && userProfile.status === 'active') {
          return <BrokerPanel currentUser={userProfile} onNavigate={navigateTo} />;
        } else if (userProfile.role === 'broker') {
          navigateTo('/broker/pending');
          return null;
        } else {
          navigateTo('/admin');
          return null;
        }

      case '/broker/pending':
        if (userProfile.role === 'broker' && userProfile.status !== 'active') {
          return <BrokerPendingPage />;
        } else {
          navigateTo('/');
          return null;
        }

      case '/login':
        return <LoginPage onNavigate={navigateTo} />;

      default:
        // Página no encontrada - redirect a home
        navigateTo('/');
        return null;
    }
  };

  return (
    <div>
      {renderCurrentPage()}
    </div>
  );
};

export default App;
