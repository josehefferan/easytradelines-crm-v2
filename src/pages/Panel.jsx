import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Archive, 
  Shield, 
  DollarSign, 
  Eye, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  UserCheck, 
  Building2, 
  CreditCard
} from 'lucide-react';
import { supabase } from "../lib/supabase";
import NewClientModal from '../components/NewClientModal';
import NewBrokerModal from '../components/NewBrokerModal';
import NewAffiliateModal from '../components/NewAffiliateModal';
import CardRegistrationModal from '../components/CardRegistrationModal';
import ClientManagement from '../components/ClientManagement'; 
import BrokerManagement from '../components/BrokerManagement';
import AffiliatesInhouseView from '../components/AffiliatesInhouseView';
import Pipeline from '../components/Pipeline';
import AffiliatePanel from './AffiliatePanel';

const ModernCRMPanel = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('dashboard');
  
  // Estados para los modales
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewBrokerModalOpen, setIsNewBrokerModalOpen] = useState(false);
  const [isNewAffiliateModalOpen, setIsNewAffiliateModalOpen] = useState(false);
  const [isCardRegistrationModalOpen, setIsCardRegistrationModalOpen] = useState(false);

  // Estados para actividad reciente y estadísticas
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Stats para el dashboard
  const [stats, setStats] = useState({
    nuevo_lead: 0,
    contactado: 0,
    en_validacion: 0,
    aprobado: 0,
    activo: 0,
    muerto: 0,
    blacklist: 0,
    total: 0,
    revenue: 0
  });

  // Cargar usuario
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Verificar si es admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_emails')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (!adminError && adminData) {
        setCurrentUser({
          role: 'admin',
          name: user.email.split('@')[0],
          email: user.email
        });
        setLoading(false);
        return;
      }

      // Verificar si es broker
      const { data: brokerData, error: brokerError } = await supabase
        .from('brokers')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (!brokerError && brokerData && brokerData.status === 'active') {
        setCurrentUser({
          role: 'broker',
          name: `${brokerData.first_name} ${brokerData.last_name}`,
          email: user.email,
          brokerId: brokerData.id,
          brokerData: brokerData
        });
        setLoading(false);
        return;
      }

      // Verificar si es affiliate
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (!affiliateError && affiliateData) {
        setCurrentUser({
          role: 'affiliate',
          name: affiliateData.first_name + ' ' + affiliateData.last_name || user.email.split('@')[0],
          email: user.email,
          affiliateId: affiliateData.id
        });
        setLoading(false);
        return;
      }

      // Por defecto, usuario viewer
      setCurrentUser({
        role: 'viewer',
        name: user.email.split('@')[0],
        email: user.email
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      window.location.href = '/login';
    }
  };

  // Cargar actividad reciente cuando el usuario esté listo
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        fetchGlobalActivity();
      } else if (currentUser.role === 'broker') {
        fetchBrokerActivity();
      }
      fetchStats();
    }
  }, [currentUser]);

  const fetchBrokerActivity = async () => {
    try {
      setLoadingActivity(true);
      
      const { data: brokerClients } = await supabase
        .from('clients')
        .select('*')
        .eq('assigned_broker_id', currentUser.brokerId)
        .order('updated_at', { ascending: false })
        .limit(10);

      const activities = [];
      
      if (brokerClients) {
        brokerClients.forEach(client => {
          activities.push({
            id: `client-${client.id}`,
            type: 'client',
            name: `${client.first_name} ${client.last_name}`,
            action: 'Client activity',
            status: client.status,
            email: client.email,
            timestamp: client.updated_at || client.created_at,
            icon: Users,
            color: '#3b82f6',
            bgColor: '#eff6ff'
          });
        });
      }

      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Error fetching broker activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchGlobalActivity = async () => {
    try {
      setLoadingActivity(true);
      const activities = [];
      
      // Obtener clientes recientes
      const { data: recentClients } = await supabase
        .from('clients')
        .select(`
          id,
          unique_id,
          first_name,
          last_name,
          email,
          status,
          created_at,
          updated_at,
          created_by,
          brokers (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentClients) {
        recentClients.forEach(client => {
          activities.push({
            id: `client-${client.id}`,
            type: 'client',
            name: `${client.first_name} ${client.last_name}`,
            action: 'New client registered',
            status: client.status,
            email: client.email,
            timestamp: client.created_at,
            icon: Users,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            broker: client.brokers ? `${client.brokers.first_name} ${client.brokers.last_name}` : 'Unassigned',
            createdBy: client.created_by || 'System'
          });
        });
      }

      // Obtener brokers recientes
      const { data: recentBrokers } = await supabase
        .from('brokers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recentBrokers) {
        recentBrokers.forEach(broker => {
          activities.push({
            id: `broker-${broker.id}`,
            type: 'broker',
            name: `${broker.first_name} ${broker.last_name}`,
            action: 'New broker registered',
            status: broker.status,
            email: broker.email,
            timestamp: broker.created_at,
            icon: UserCheck,
            color: '#22c55e',
            bgColor: '#f0fdf4',
            createdBy: 'Admin'
          });
        });
      }

      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activities.slice(0, 10));
      
    } catch (error) {
      console.error('Error fetching global activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchStats = async () => {
    try {
      let query = supabase.from('clients').select('status');
      
      if (currentUser.role === 'broker') {
        const { data: brokerClients } = await supabase
          .from('clients')
          .select('status')
          .eq('assigned_broker_id', currentUser.brokerId);
        
        if (brokerClients) {
          const newStats = {
            nuevo_lead: 0,
            contactado: 0,
            en_validacion: 0,
            aprobado: 0,
            activo: 0,
            muerto: 0,
            blacklist: 0,
            total: brokerClients.length,
            revenue: 0
          };

          brokerClients.forEach(client => {
            switch(client.status) {
              case 'new_lead':
                newStats.nuevo_lead++;
                break;
              case 'contacted':
                newStats.contactado++;
                break;
              case 'qualification':
              case 'in_validation':
                newStats.en_validacion++;
                break;
              case 'approved':
                newStats.aprobado++;
                break;
              case 'active':
                newStats.activo++;
                break;
              case 'expired':
              case 'dead':
                newStats.muerto++;
                break;
              case 'blacklist':
                newStats.blacklist++;
                break;
            }
          });

          setStats(newStats);
        }
      } else {
        // Admin ve todas las stats
        const { data: clients } = await query;
        
        if (clients) {
          const newStats = {
            nuevo_lead: 0,
            contactado: 0,
            en_validacion: 0,
            aprobado: 0,
            activo: 0,
            muerto: 0,
            blacklist: 0,
            total: clients.length,
            revenue: 17200
          };

          clients.forEach(client => {
            switch(client.status) {
              case 'new_lead':
                newStats.nuevo_lead++;
                break;
              case 'contacted':
                newStats.contactado++;
                break;
              case 'qualification':
              case 'in_validation':
                newStats.en_validacion++;
                break;
              case 'approved':
                newStats.aprobado++;
                break;
              case 'active':
                newStats.activo++;
                break;
              case 'expired':
              case 'dead':
                newStats.muerto++;
                break;
              case 'blacklist':
                newStats.blacklist++;
                break;
            }
          });

          setStats(newStats);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const statusConfig = {
    nuevo_lead: { 
      label: 'New Lead', 
      color: '#3b82f6', 
      bgColor: '#eff6ff', 
      textColor: '#1d4ed8',
      icon: Plus
    },
    contactado: { 
      label: 'Contacted', 
      color: '#eab308', 
      bgColor: '#fefce8', 
      textColor: '#a16207',
      icon: Users
    },
    en_validacion: { 
      label: 'In Validation', 
      color: '#a855f7', 
      bgColor: '#faf5ff', 
      textColor: '#7c3aed',
      icon: Clock
    },
    aprobado: { 
      label: 'Approved', 
      color: '#22c55e', 
      bgColor: '#f0fdf4', 
      textColor: '#15803d',
      icon: CheckCircle
    },
    rechazado: { 
      label: 'Rejected', 
      color: '#ef4444', 
      bgColor: '#fef2f2', 
      textColor: '#dc2626',
      icon: XCircle
    },
    activo: { 
      label: 'Active', 
      color: '#10b981', 
      bgColor: '#ecfdf5', 
      textColor: '#059669',
      icon: TrendingUp
    },
    muerto: { 
      label: 'Dead/Archived', 
      color: '#6b7280', 
      bgColor: '#f9fafb', 
      textColor: '#374151',
      icon: Archive
    },
    blacklist: { 
      label: 'Blacklist', 
      color: '#000000', 
      bgColor: '#f3f4f6', 
      textColor: '#111827',
      icon: Shield
    }
  };

  const LogoSVG = () => (
    <svg width="40" height="40" viewBox="0 0 120 60" style={{ marginRight: '12px' }}>
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

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'archive', label: 'Archive', icon: Archive },
      { id: 'reports', label: 'Reports', icon: Eye }
    ];

    // Solo admin ve estas opciones
    if (currentUser && currentUser.role === 'admin') {
      baseItems.push(
        { id: 'brokers', label: 'Brokers', icon: UserCheck },
        { id: 'affiliates', label: 'Affiliates & Inhouse', icon: Building2 }
      );
    }

    baseItems.push({ id: 'settings', label: 'Settings', icon: Settings });
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const getHeaderButtons = () => {
    const buttons = [];
    
    if (!currentUser) return buttons;
    
    // Botón New Client - visible para admin, broker y affiliate
    if (currentUser.role === 'admin' || currentUser.role === 'broker') {
      buttons.push({
        key: 'client',
        label: 'New Client',
        icon: Users,
        color: '#16a34a',
        hoverColor: '#15803d',
        onClick: () => setIsNewClientModalOpen(true)
      });
    }

    // Botón Card Registration - solo affiliate ve este botón
    if (currentUser.role === 'affiliate') {
      buttons.push({
        key: 'card',
        label: 'Card Registration',
        icon: CreditCard,
        color: '#10b981',
        hoverColor: '#059669',
        onClick: () => setIsCardRegistrationModalOpen(true)
      });
    }

    // Botones adicionales solo para admin
    if (currentUser && currentUser.role === 'admin') {
      buttons.push({
        key: 'broker',
        label: 'New Broker',
        icon: UserCheck,
        color: '#2563eb',
        hoverColor: '#1d4ed8',
        onClick: () => setIsNewBrokerModalOpen(true)
      });

      buttons.push({
        key: 'affiliate',
        label: 'New Affiliate',
        icon: Building2,
        color: '#7c3aed',
        hoverColor: '#6d28d9',
        onClick: () => setIsNewAffiliateModalOpen(true)
      });
      
      buttons.push({
        key: 'card',
        label: 'Card Registration',
        icon: CreditCard,
        color: '#ea580c',
        hoverColor: '#dc2626',
        onClick: () => setIsCardRegistrationModalOpen(true)
      });
    }

    return buttons;
  };

  // Inline Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '256px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000
    },
    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '24px',
      borderBottom: '1px solid #e5e7eb'
    },
    sidebarTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    sidebarRole: {
      fontSize: '12px',
      color: '#16a34a',
      fontWeight: '500'
    },
    navButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '12px 24px',
      textAlign: 'left',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px'
    },
    navButtonActive: {
      backgroundColor: '#f0fdf4',
      color: '#15803d',
      borderRight: '2px solid #16a34a'
    },
    navIcon: {
      width: '20px',
      height: '20px',
      marginRight: '12px'
    },
    sidebarFooter: {
      position: 'absolute',
      bottom: 0,
      width: '256px',
      padding: '24px',
      borderTop: '1px solid #e5e7eb'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px'
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      backgroundColor: '#16a34a',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1f2937',
      margin: 0
    },
    userEmail: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0
    },
    signOutButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'color 0.2s',
      fontSize: '14px'
    },
    mainContent: {
      marginLeft: '256px',
      padding: '32px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px'
    },
    headerTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    headerSubtitle: {
      color: '#6b7280',
      marginTop: '4px',
      fontSize: '16px'
    },
    buttonsContainer: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    actionButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '14px',
      fontWeight: '500',
      color: 'white'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: currentUser?.role === 'broker' 
        ? 'repeat(auto-fit, minmax(250px, 1fr))'
        : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    },
    statCardContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statLabel: {
      fontSize: '14px',
      opacity: 0.9,
      margin: 0
    },
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      margin: '4px 0 0 0'
    },
    statTrend: {
      fontSize: '14px',
      marginTop: '16px',
      opacity: 0.9
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '32px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    activityIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    activityName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1f2937',
      margin: 0
    },
    activityStatus: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0
    },
    activityTime: {
      fontSize: '12px',
      color: '#9ca3af',
      marginLeft: 'auto'
    },
    statusSummaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px'
    },
    statusCard: {
      padding: '12px',
      borderRadius: '8px'
    },
    statusHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    statusLabel: {
      fontSize: '14px',
      fontWeight: '500'
    },
    statusCount: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Renderizar directamente el AffiliatePanel si el usuario es affiliate
  if (currentUser.role === 'affiliate') {
    return <AffiliatePanel currentUser={currentUser} />;
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <LogoSVG />
          <div>
            <h1 style={styles.sidebarTitle}>EasyTradelines</h1>
            <p style={styles.sidebarRole}>{currentUser.role.toUpperCase()}</p>
          </div>
        </div>

        <nav style={{ marginTop: '24px' }}>
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            const isActive = selectedView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                style={{
                  ...styles.navButton,
                  ...(isActive ? styles.navButtonActive : {})
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <IconComponent style={styles.navIcon} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              <span style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p style={styles.userName}>{currentUser.name}</p>
              <p style={styles.userEmail}>{currentUser.email}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            style={styles.signOutButton}
            onMouseEnter={(e) => {
              e.target.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#6b7280';
            }}
          >
            <LogOut style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        {selectedView !== 'clients' && (
          <div style={styles.header}>
            <div>
              <h2 style={styles.headerTitle}>
                {selectedView === 'dashboard' && 'Dashboard'}
                {selectedView === 'pipeline' && 'Sales Pipeline'}
                {selectedView === 'archive' && 'Archived Clients'}
                {selectedView === 'brokers' && 'Broker Management'}
                {selectedView === 'affiliates' && 'Affiliates & Inhouse List'}
                {selectedView === 'reports' && 'Reports & Analytics'}
                {selectedView === 'settings' && 'Settings'}
              </h2>
              <p style={styles.headerSubtitle}>
                {selectedView === 'dashboard' && 'CRM overview and key metrics'}
                {selectedView === 'pipeline' && 'Kanban view of client pipeline'}
                {selectedView === 'archive' && 'View archived and dead clients'}
                {selectedView === 'brokers' && 'Manage brokers and their history'}
                {selectedView === 'affiliates' && 'Manage affiliates and inhouse tradelines'}
                {selectedView === 'reports' && 'Performance metrics and reports'}
                {selectedView === 'settings' && 'System configuration'}
              </p>
            </div>
            
            <div style={styles.buttonsContainer}>
              {getHeaderButtons().map(button => {
                const IconComponent = button.icon;
                return (
                  <button
                    key={button.key}
                    onClick={button.onClick}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: button.color
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = button.hoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = button.color;
                    }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    {button.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {selectedView === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              <div style={{
                ...styles.statCard,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              }}>
                <div style={styles.statCardContent}>
                  <div>
                    <p style={styles.statLabel}>New Leads</p>
                    <p style={styles.statValue}>{stats.nuevo_lead}</p>
                  </div>
                  <Plus style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>
                  {currentUser.role === 'broker' ? 'Your new leads' : '+12% vs last month'}
                </div>
              </div>

              <div style={{
                ...styles.statCard,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              }}>
                <div style={styles.statCardContent}>
                  <div>
                    <p style={styles.statLabel}>Active</p>
                    <p style={styles.statValue}>{stats.activo}</p>
                  </div>
                  <TrendingUp style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>
                  {currentUser.role === 'broker' ? 'Your active clients' : '+8% vs last month'}
                </div>
              </div>

              <div style={{
                ...styles.statCard,
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
              }}>
                <div style={styles.statCardContent}>
                  <div>
                    <p style={styles.statLabel}>In Validation</p>
                    <p style={styles.statValue}>{stats.en_validacion}</p>
                  </div>
                  <Clock style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>Average 3 days</div>
              </div>

              {/* Total Revenue - Solo para Admin */}
              {currentUser.role === 'admin' && (
                <div style={{
                  ...styles.statCard,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}>
                  <div style={styles.statCardContent}>
                    <div>
                      <p style={styles.statLabel}>Total Revenue</p>
                      <p style={styles.statValue}>${stats.revenue.toLocaleString()}</p>
                    </div>
                    <DollarSign style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                  </div>
                  <div style={styles.statTrend}>+15% vs last month</div>
                </div>
              )}
            </div>

            {/* Content Cards */}
            <div style={styles.contentGrid}>
              {/* Recent Activity */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Recent Activity</h3>
                {loadingActivity ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                    Loading activity...
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                    No recent activity
                  </div>
                ) : (
                  recentActivity.map(activity => {
                    const StatusIcon = activity.icon;
                    return (
                      <div key={activity.id} style={styles.activityItem}>
                        <div style={{
                          ...styles.activityIcon,
                          backgroundColor: activity.bgColor
                        }}>
                          <StatusIcon style={{ 
                            width: '16px', 
                            height: '16px', 
                            color: activity.color 
                          }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={styles.activityName}>
                            {activity.name}
                            {currentUser.role === 'admin' && activity.type === 'client' && activity.broker && (
                              <span style={{ 
                                fontSize: '11px', 
                                color: '#16a34a',
                                marginLeft: '8px',
                                backgroundColor: '#f0fdf4',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                {activity.broker}
                              </span>
                            )}
                          </p>
                          <p style={styles.activityStatus}>
                            {activity.action}
                            {currentUser.role === 'admin' && activity.createdBy && (
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {' by '}{activity.createdBy}
                              </span>
                            )}
                          </p>
                          {activity.type === 'client' && (
                            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                              Status: {activity.status?.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                        <span style={styles.activityTime}>
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Status Summary</h3>
                <div style={styles.statusSummaryGrid}>
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const StatusIcon = config.icon;
                    return (
                      <div key={status} style={{
                        ...styles.statusCard,
                        backgroundColor: config.bgColor
                      }}>
                        <div style={styles.statusHeader}>
                          <StatusIcon style={{ 
                            width: '16px', 
                            height: '16px', 
                            color: config.textColor 
                          }} />
                          <span style={{
                            ...styles.statusLabel,
                            color: config.textColor
                          }}>
                            {config.label}
                          </span>
                        </div>
                        <p style={{
                          ...styles.statusCount,
                          color: config.textColor
                        }}>
                          {stats[status] || 0}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Views específicas */}
        {selectedView === 'clients' && <ClientManagement currentUser={currentUser} />}
        {selectedView === 'pipeline' && <Pipeline currentUser={currentUser} />}
        {selectedView === 'brokers' && currentUser.role === 'admin' && <BrokerManagement currentUser={currentUser} />}
        {selectedView === 'affiliates' && currentUser.role === 'admin' && <AffiliatesInhouseView currentUser={currentUser} />}
        
        {/* Otras vistas */}
        {(selectedView === 'archive' || selectedView === 'reports' || selectedView === 'settings') && (
          <div style={styles.card}>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {selectedView === 'archive' && 'Archived clients management - Coming soon'}
              {selectedView === 'reports' && 'Reports and analytics dashboard - Coming soon'}
              {selectedView === 'settings' && 'System settings and configuration - Coming soon'}
            </p>
          </div>
        )}
      </div>
      
      {/* Modales */}
      <NewClientModal 
        isOpen={isNewClientModalOpen}
        onClose={() => {
          setIsNewClientModalOpen(false);
          if (currentUser.role === 'broker') {
            fetchBrokerActivity();
          } else {
            fetchGlobalActivity();
          }
          fetchStats();
        }}
        currentUser={currentUser}
      />
      
      {currentUser.role === 'admin' && (
        <>
          <NewBrokerModal 
            isOpen={isNewBrokerModalOpen}
            onClose={() => {
              setIsNewBrokerModalOpen(false);
              fetchGlobalActivity();
            }}
            currentUser={currentUser}
          />
          
          <NewAffiliateModal 
            isOpen={isNewAffiliateModalOpen}
            onClose={() => {
              setIsNewAffiliateModalOpen(false);
              fetchGlobalActivity();
            }}
            currentUser={currentUser}
          />
          
          <CardRegistrationModal 
            isOpen={isCardRegistrationModalOpen}
            onClose={() => setIsCardRegistrationModalOpen(false)}
            currentUser={currentUser}
            onSubmit={async (data) => {
              try {
                const { data: newCard, error } = await supabase
                  .from('cards')
                  .insert([{
                    bank: data.bank,
                    account_limit: data.account_limit,
                    open_date: data.open_date,
                    statement_date: data.statement_date,
                    card_address: data.card_address,
                    default_cycles: data.default_cycles,
                    default_spots: data.default_spots,
                    payout: data.payout,
                    owner_type: data.owner_type,
                    owner_id: currentUser.id || null,
                    registered_by: currentUser.email,
                    status: 'active'
                  }])
                  .select()
                  .single();

                if (error) throw error;

                alert('Card registered successfully!');
                setIsCardRegistrationModalOpen(false);
                fetchGlobalActivity();
                
              } catch (error) {
                console.error('Error registering card:', error);
                alert('Error registering card. Please try again.');
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default ModernCRMPanel;
