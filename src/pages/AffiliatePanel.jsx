import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Users, 
  DollarSign,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Plus,
  Building2,
  BarChart3,
  Eye,
  Archive,
  Settings,
  LogOut
} from 'lucide-react';
import { supabase } from "../lib/supabase";
import CardRegistrationModal from '../components/CardRegistrationModal';

const AffiliatePanel = ({ currentUser }) => {
  const [cards, setCards] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedView, setSelectedView] = useState('dashboard');
  const [isCardRegistrationModalOpen, setIsCardRegistrationModalOpen] = useState(false);

  // Estados de las tarjetas
  const cardStatusConfig = {
    under_review: {
      label: 'Under Review',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      textColor: '#92400e',
      icon: Clock,
      stage: 1
    },
    accepted: {
      label: 'Accepted',
      color: '#10b981',
      bgColor: '#d1fae5',
      textColor: '#065f46',
      icon: CheckCircle,
      stage: 2
    },
    assigned: {
      label: 'Assigned to Client',
      color: '#22c55e',
      bgColor: '#dcfce7',
      textColor: '#166534',
      icon: Users,
      stage: 3
    },
    rejected: {
      label: 'Rejected',
      color: '#ef4444',
      bgColor: '#fef2f2',
      textColor: '#991b1b',
      icon: AlertTriangle,
      stage: 4
    }
  };

  // Cargar datos del affiliate
  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      // Obtener ID del affiliate actual
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('id')
        .eq('email', currentUser.email)
        .single();

      if (affiliateError) {
        console.error('Error fetching affiliate ID:', affiliateError);
        setLoading(false);
        return;
      }

      if (affiliateData) {
        // Obtener tarjetas del affiliate
        await fetchCards(affiliateData.id);
        // Obtener comisiones del affiliate
        await fetchCommissions(affiliateData.id);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async (affiliateId) => {
    try {
      const { data, error } = await supabase
        .from('tradeline_cards')
        .select(`
          *,
          clients (
            id,
            custom_id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('affiliate_id', affiliateId)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    }
  };

  const fetchCommissions = async (affiliateId) => {
    try {
      const { data, error } = await supabase
        .from('affiliate_commissions')
        .select(`
          *,
          tradeline_cards (
            card_number_last_4,
            bank_name
          )
        `)
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissions(data || []);
    } catch (error) {
      console.error('Error fetching commissions:', error);
      setCommissions([]);
    }
  };

  // Filtrar tarjetas
  const filteredCards = cards.filter(card => {
    if (filter === 'all') return true;
    return card.status === filter;
  });

  // Estadísticas
  const getStats = () => {
    const stats = {
      total: cards.length,
      under_review: cards.filter(c => c.status === 'under_review').length,
      accepted: cards.filter(c => c.status === 'accepted').length,
      assigned: cards.filter(c => c.status === 'assigned').length,
      rejected: cards.filter(c => c.status === 'rejected').length,
      totalCommissions: commissions.reduce((sum, comm) => sum + (comm.amount || 0), 0),
      paidCommissions: commissions.filter(c => c.status === 'paid').reduce((sum, comm) => sum + (comm.amount || 0), 0),
      pendingCommissions: commissions.filter(c => c.status === 'pending').reduce((sum, comm) => sum + (comm.amount || 0), 0)
    };
    return stats;
  };

  const stats = getStats();

  // Abrir modal de registro de tarjeta
  const openCardRegistration = () => {
    setIsCardRegistrationModalOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Navegación específica para affiliate
  const getNavigationItems = () => {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'cards', label: 'My Cards', icon: CreditCard },
      { id: 'commissions', label: 'Commissions', icon: DollarSign },
      { id: 'reports', label: 'Reports', icon: Eye },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];
  };

  const navigationItems = getNavigationItems();

  // Logo SVG idéntico al panel principal
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

  // Estilos idénticos al panel principal
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
      color: 'white',
      backgroundColor: '#10b981'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
      marginBottom: '16px'
    },
    filtersContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '6px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '13px',
      transition: 'all 0.2s',
      fontWeight: '500'
    },
    filterButtonActive: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    cardItem: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    cardNumber: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      fontFamily: 'monospace'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    cardDetails: {
      marginBottom: '16px'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '6px',
      fontSize: '13px',
      color: '#6b7280'
    },
    assignedClient: {
      fontSize: '12px',
      color: '#059669',
      fontWeight: '500',
      marginTop: '8px',
      padding: '6px 10px',
      backgroundColor: '#f0fdf4',
      borderRadius: '6px'
    },
    commissionTable: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tableRow: {
      borderBottom: '1px solid #f3f4f6'
    },
    tableCell: {
      padding: '12px 16px',
      fontSize: '14px',
      color: '#1f2937'
    },
    commissionStatus: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase'
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
        Loading affiliate panel...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar - Idéntico al panel principal */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <LogoSVG />
          <div>
            <h1 style={styles.sidebarTitle}>EasyTradelines</h1>
            <p style={styles.sidebarRole}>AFFILIATE</p>
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
        <div style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>
              {selectedView === 'dashboard' && 'Affiliate Dashboard'}
              {selectedView === 'cards' && 'My Tradeline Cards'}
              {selectedView === 'commissions' && 'Commission History'}
              {selectedView === 'reports' && 'Reports & Analytics'}
              {selectedView === 'settings' && 'Settings'}
            </h2>
            <p style={styles.headerSubtitle}>
              {selectedView === 'dashboard' && 'Manage your tradeline cards and track commissions'}
              {selectedView === 'cards' && 'View and manage all your registered cards'}
              {selectedView === 'commissions' && 'Track earnings and payment history'}
              {selectedView === 'reports' && 'Performance metrics and reports'}
              {selectedView === 'settings' && 'Account configuration'}
            </p>
          </div>
          
          <div style={styles.buttonsContainer}>
            <button
              onClick={openCardRegistration}
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Card Registration
            </button>
          </div>
        </div>

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
                    <p style={styles.statLabel}>Total Cards</p>
                    <p style={styles.statValue}>{stats.total}</p>
                  </div>
                  <CreditCard style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>All registered cards</div>
              </div>

              <div style={{
                ...styles.statCard,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              }}>
                <div style={styles.statCardContent}>
                  <div>
                    <p style={styles.statLabel}>Under Review</p>
                    <p style={styles.statValue}>{stats.under_review}</p>
                  </div>
                  <Clock style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>Pending admin approval</div>
              </div>

              <div style={{
                ...styles.statCard,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              }}>
                <div style={styles.statCardContent}>
                  <div>
                    <p style={styles.statLabel}>Accepted</p>
                    <p style={styles.statValue}>{stats.accepted}</p>
                  </div>
                  <CheckCircle style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>Approved and available</div>
              </div>

              <div style={{
                ...styles.statCard,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}>
                <div style={styles.statCardContent}>
                  <div>
                    <p style={styles.statLabel}>Total Earnings</p>
                    <p style={styles.statValue}>${stats.totalCommissions.toFixed(2)}</p>
                  </div>
                  <DollarSign style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>All-time commissions</div>
              </div>

              <div style={{
                ...styles.statCard,
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
              }}>
                <div style={styles.statCardContent}>
                  <div>
                    <p style={styles.statLabel}>Assigned</p>
                    <p style={styles.statValue}>{stats.assigned}</p>
                  </div>
                  <Users style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>Currently rented</div>
              </div>

              <div style={{
                ...styles.statCard,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
              }}>
                <div style={styles.statCardContent}>
                  <div>
                    <p style={styles.statLabel}>Pending Payout</p>
                    <p style={styles.statValue}>${stats.pendingCommissions.toFixed(2)}</p>
                  </div>
                  <TrendingUp style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                </div>
                <div style={styles.statTrend}>Awaiting payment</div>
              </div>
            </div>
          </div>
        )}

        {/* Cards Section */}
        {(selectedView === 'dashboard' || selectedView === 'cards') && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>My Tradeline Cards</h3>

            {/* Filters */}
            <div style={styles.filtersContainer}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  ...styles.filterButton,
                  ...(filter === 'all' ? styles.filterButtonActive : {})
                }}
              >
                All Cards ({stats.total})
              </button>
              {Object.entries(cardStatusConfig).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  style={{
                    ...styles.filterButton,
                    ...(filter === status ? styles.filterButtonActive : {})
                  }}
                >
                  {config.label} ({stats[status] || 0})
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div style={styles.cardsGrid}>
              {filteredCards.map(card => {
                const statusConfig = cardStatusConfig[card.status] || cardStatusConfig.under_review;
                const StatusIcon = statusConfig.icon;

                return (
                  <div 
                    key={card.id} 
                    style={{
                      ...styles.cardItem,
                      borderLeft: `4px solid ${statusConfig.color}`
                    }}
                  >
                    {/* Header */}
                    <div style={styles.cardHeader}>
                      <div style={styles.cardNumber}>
                        **** **** **** {card.card_number_last_4}
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

                    {/* Details */}
                    <div style={styles.cardDetails}>
                      <div style={styles.detailItem}>
                        <Building2 style={{ width: '14px', height: '14px' }} />
                        {card.bank_name}
                      </div>
                      <div style={styles.detailItem}>
                        <DollarSign style={{ width: '14px', height: '14px' }} />
                        Credit Limit: ${card.credit_limit?.toLocaleString() || 'N/A'}
                      </div>
                      <div style={styles.detailItem}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        Registered: {new Date(card.created_at).toLocaleDateString()}
                      </div>

                      {/* Client Info if assigned */}
                      {card.status === 'assigned' && card.clients && (
                        <div style={styles.assignedClient}>
                          Assigned to: {card.clients.first_name} {card.clients.last_name} (ID: {card.clients.custom_id})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCards.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <CreditCard style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
                <h3 style={{ margin: '0 0 8px 0' }}>No cards found</h3>
                <p style={{ margin: 0 }}>
                  {filter === 'all' ? 'No cards registered yet' : `No cards with status "${cardStatusConfig[filter]?.label || filter}"`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Commissions Section */}
        {(selectedView === 'dashboard' || selectedView === 'commissions') && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Commission History</h3>

            {commissions.length > 0 ? (
              <table style={styles.commissionTable}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Date</th>
                    <th style={styles.tableHeaderCell}>Card</th>
                    <th style={styles.tableHeaderCell}>Amount</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(commission => (
                    <tr key={commission.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {new Date(commission.created_at).toLocaleDateString()}
                      </td>
                      <td style={styles.tableCell}>
                        {commission.tradeline_cards?.bank_name} ****{commission.tradeline_cards?.card_number_last_4}
                      </td>
                      <td style={styles.tableCell}>
                        ${commission.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.commissionStatus,
                            backgroundColor: commission.status === 'paid' ? '#d1fae5' : '#fef3c7',
                            color: commission.status === 'paid' ? '#065f46' : '#92400e'
                          }}
                        >
                          {commission.status || 'pending'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {commission.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <DollarSign style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
                <h3 style={{ margin: '0 0 8px 0' }}>No commissions yet</h3>
                <p style={{ margin: 0 }}>Commission history will appear here once your cards are assigned to clients.</p>
              </div>
            )}
          </div>
        )}

        {/* Otras vistas */}
        {(selectedView === 'reports' || selectedView === 'settings') && (
          <div style={styles.card}>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {selectedView === 'reports' && 'Reports and analytics dashboard - Coming soon'}
              {selectedView === 'settings' && 'Account settings and configuration - Coming soon'}
            </p>
          </div>
        )}
      </div>

      {/* Card Registration Modal */}
      <CardRegistrationModal 
        isOpen={isCardRegistrationModalOpen}
        onClose={() => setIsCardRegistrationModalOpen(false)}
        currentUser={currentUser}
        onSubmit={async (data) => {
          try {
            // Obtener ID del affiliate actual
            const { data: affiliateData } = await supabase
              .from('affiliates')
              .select('id')
              .eq('email', currentUser.email)
              .single();

            if (!affiliateData) {
              throw new Error('Affiliate not found');
            }

            const { data: newCard, error } = await supabase
              .from('tradeline_cards')
              .insert([{
                bank_name: data.bank_name,
                credit_limit: data.credit_limit,
                card_number_last_4: data.card_number_last_4,
                open_date: data.open_date,
                statement_date: data.statement_date,
                affiliate_id: affiliateData.id,
                status: 'under_review',
                archived: false
              }])
              .select()
              .single();

            if (error) throw error;

            alert('Card registered successfully! It will be reviewed by an admin.');
            setIsCardRegistrationModalOpen(false);
            fetchAffiliateData(); // Refrescar datos
            
          } catch (error) {
            console.error('Error registering card:', error);
            alert('Error registering card. Please try again.');
          }
        }}
      />
    </div>
  );
};

export default AffiliatePanel;
