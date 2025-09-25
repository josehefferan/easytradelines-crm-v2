import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Eye, 
  BarChart3, 
  Settings, 
  LogOut, 
  CreditCard,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  User,
  Building2
} from 'lucide-react';
import { supabase } from "../lib/supabase";

const BrokerPanel = () => {
  // Simulando currentUser - en la implementación real vendría de auth
  const [currentUser] = useState({
    id: '75e31dda-975d-43f4-ae37-65a1114d0058', // ID del broker Test
    role: 'broker',
    name: 'Test Broker',
    email: 'testbroker@email.com',
    custom_id: 'B-20250925-0001',
    status: 'active'
  });

  const [selectedView, setSelectedView] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [tradelines, setTradelines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewTradelineModalOpen, setIsNewTradelineModalOpen] = useState(false);

  const clientStatusConfig = {
    new_lead: { label: 'New Lead', color: '#6b7280', bgColor: '#f9fafb', textColor: '#374151', icon: Users },
    contacted: { label: 'Contacted', color: '#f59e0b', bgColor: '#fef3c7', textColor: '#92400e', icon: Phone },
    qualification: { label: 'In Qualification', color: '#f59e0b', bgColor: '#fef3c7', textColor: '#92400e', icon: Eye },
    proposal: { label: 'Proposal Sent', color: '#eab308', bgColor: '#fefce8', textColor: '#a16207', icon: Mail },
    negotiation: { label: 'In Negotiation', color: '#eab308', bgColor: '#fefce8', textColor: '#a16207', icon: TrendingUp },
    approved: { label: 'Approved', color: '#10b981', bgColor: '#d1fae5', textColor: '#065f46', icon: CheckCircle },
    active: { label: 'Active', color: '#22c55e', bgColor: '#dcfce7', textColor: '#166534', icon: CreditCard },
    blacklist: { label: 'Blacklisted', color: '#000000', bgColor: '#f3f4f6', textColor: '#111827', icon: XCircle }
  };

  const tradelineStatusConfig = {
    pre_registered: { label: 'Pending Validation', color: '#f59e0b', bgColor: '#fef3c7', textColor: '#92400e', icon: Clock },
    validated: { label: 'Validated', color: '#10b981', bgColor: '#d1fae5', textColor: '#065f46', icon: CheckCircle },
    active: { label: 'Active', color: '#22c55e', bgColor: '#dcfce7', textColor: '#166534', icon: CreditCard },
    expired: { label: 'Expired', color: '#6b7280', bgColor: '#f9fafb', textColor: '#374151', icon: XCircle }
  };

  // Cargar datos del broker
  useEffect(() => {
    if (currentUser.status === 'active') {
      fetchMyClients();
      fetchMyTradelines();
    }
  }, []);

  const fetchMyClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('assigned_broker_id', currentUser.id)
        .eq('archived', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTradelines = async () => {
    try {
      const { data, error } = await supabase
        .from('tradelines')
        .select(`
          *,
          clients (
            id,
            custom_id,
            first_name,
            last_name
          )
        `)
        .eq('broker_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTradelines(data || []);
    } catch (error) {
      console.error('Error fetching tradelines:', error);
    }
  };

  // Estadísticas del broker
  const getStats = () => {
    const stats = {
      totalClients: clients.length,
      newLeads: clients.filter(c => c.status === 'new_lead').length,
      approved: clients.filter(c => c.status === 'approved').length,
      active: clients.filter(c => c.status === 'active').length,
      totalTradelines: tradelines.length,
      pendingTradelines: tradelines.filter(t => t.status === 'pre_registered').length,
      activeTradelines: tradelines.filter(t => t.status === 'active').length
    };
    return stats;
  };

  const stats = getStats();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'clients', label: 'My Clients', icon: Users },
    { id: 'tradelines', label: 'Tradelines', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
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
      color: '#3b82f6',
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
      backgroundColor: '#eff6ff',
      color: '#3b82f6',
      borderRight: '2px solid #3b82f6'
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
      backgroundColor: '#3b82f6',
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
    brokerId: {
      fontSize: '11px',
      color: '#3b82f6',
      fontFamily: 'monospace',
      fontWeight: '500'
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
    actionButton: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: '#3b82f6',
      color: 'white',
      transition: 'background-color 0.2s'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statInfo: {
      flex: 1
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '4px 0 0 0'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    clientItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6'
    },
    clientInfo: {
      flex: 1
    },
    clientName: {
      fontSize: '15px',
      fontWeight: '500',
      color: '#1f2937',
      margin: 0
    },
    clientId: {
      fontSize: '12px',
      color: '#6b7280',
      fontFamily: 'monospace',
      marginTop: '2px'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    }
  };

  // Si el broker no está activo, mostrar mensaje
  if (currentUser.status !== 'active') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Clock style={{ width: '64px', height: '64px', color: '#6b7280', margin: '0 auto 16px' }} />
          <h2 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>Account Pending Approval</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Your broker account is being reviewed by our admin team. You'll receive access once approved.
          </p>
        </div>
      </div>
    );
  }

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
          <Clock style={{ width: '48px', height: '48px', color: '#6b7280' }} />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <LogoSVG />
          <div>
            <h1 style={styles.sidebarTitle}>EasyTradelines</h1>
            <p style={styles.sidebarRole}>BROKER PANEL</p>
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
              <p style={styles.brokerId}>{currentUser.custom_id}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            style={styles.signOutButton}
          >
            <LogOut style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>
              {selectedView === 'dashboard' && 'Dashboard'}
              {selectedView === 'clients' && 'My Clients'}
              {selectedView === 'tradelines' && 'Tradelines Management'}
              {selectedView === 'profile' && 'Profile'}
              {selectedView === 'settings' && 'Settings'}
            </h2>
            <p style={styles.headerSubtitle}>
              {selectedView === 'dashboard' && 'Your performance overview'}
              {selectedView === 'clients' && 'Manage your assigned clients'}
              {selectedView === 'tradelines' && 'Pre-register and track tradelines'}
              {selectedView === 'profile' && 'Your broker information'}
              {selectedView === 'settings' && 'Account preferences'}
            </p>
          </div>
          
          {(selectedView === 'clients' || selectedView === 'tradelines') && (
            <button
              onClick={() => selectedView === 'clients' ? 
                setIsNewClientModalOpen(true) : 
                setIsNewTradelineModalOpen(true)
              }
              style={styles.actionButton}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              {selectedView === 'clients' ? 'New Client' : 'Pre-register Tradeline'}
            </button>
          )}
        </div>

        {/* Dashboard Content */}
        {selectedView === 'dashboard' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: '#eff6ff'}}>
                  <Users style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                </div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Total Clients</p>
                  <p style={styles.statValue}>{stats.totalClients}</p>
                </div>
              </div>
              
              <div style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: '#f0fdf4'}}>
                  <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} />
                </div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Approved</p>
                  <p style={styles.statValue}>{stats.approved}</p>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: '#dcfce7'}}>
                  <CreditCard style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                </div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Active Tradelines</p>
                  <p style={styles.statValue}>{stats.activeTradelines}</p>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: '#fef3c7'}}>
                  <Clock style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                </div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Pending Validation</p>
                  <p style={styles.statValue}>{stats.pendingTradelines}</p>
                </div>
              </div>
            </div>

            {/* Recent Clients */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                <span>Recent Clients</span>
                <button
                  onClick={() => setSelectedView('clients')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  View all
                </button>
              </div>
              {clients.slice(0, 5).map(client => {
                const statusConfig = clientStatusConfig[client.status];
                const StatusIcon = statusConfig.icon;
                return (
                  <div key={client.id} style={styles.clientItem}>
                    <div style={styles.clientInfo}>
                      <p style={styles.clientName}>
                        {client.first_name} {client.last_name}
                      </p>
                      <p style={styles.clientId}>{client.custom_id}</p>
                    </div>
                    <div
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.textColor
                      }}
                    >
                      <StatusIcon style={{ width: '12px', height: '12px' }} />
                      {statusConfig.label}
                    </div>
                  </div>
                );
              })}
              {clients.length === 0 && (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>
                  No clients assigned yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* Clients View */}
        {selectedView === 'clients' && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              <span>My Clients ({clients.length})</span>
            </div>
            {clients.map(client => {
              const statusConfig = clientStatusConfig[client.status];
              const StatusIcon = statusConfig.icon;
              return (
                <div key={client.id} style={styles.clientItem}>
                  <div style={styles.clientInfo}>
                    <p style={styles.clientName}>
                      {client.first_name} {client.last_name}
                    </p>
                    <p style={styles.clientId}>{client.custom_id} • {client.email}</p>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.textColor
                    }}
                  >
                    <StatusIcon style={{ width: '12px', height: '12px' }} />
                    {statusConfig.label}
                  </div>
                </div>
              );
            })}
            {clients.length === 0 && (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
                No clients assigned to you yet
              </p>
            )}
          </div>
        )}

        {/* Other Views */}
        {(selectedView === 'tradelines' || selectedView === 'profile' || selectedView === 'settings') && (
          <div style={styles.card}>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {selectedView === 'tradelines' && 'Tradelines management - Coming soon'}
              {selectedView === 'profile' && 'Profile management - Coming soon'}
              {selectedView === 'settings' && 'Settings panel - Coming soon'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerPanel;
