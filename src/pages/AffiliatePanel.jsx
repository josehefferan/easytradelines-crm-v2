import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Eye, 
  Clock, 
  CheckCircle, 
  Users, 
  DollarSign,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Plus,
  FileText,
  Building2
} from 'lucide-react';
import { supabase } from "../lib/supabase";

const AffiliatePanel = ({ currentUser }) => {
  const [cards, setCards] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
    // Aquí implementarás el modal de registro de tarjeta
    alert('Card Registration Modal - To be implemented');
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px',
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    avatar: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    headerInfo: {
      flex: 1
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    subtitle: {
      color: '#6b7280',
      marginTop: '4px',
      fontSize: '14px'
    },
    cardRegButton: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
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
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500'
    },
    statIcon: {
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: '#f3f4f6'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    statSubtext: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937'
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
      <div style={{ ...styles.container, textAlign: 'center', padding: '60px' }}>
        <Clock style={{ width: '48px', height: '48px', color: '#6b7280' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading your affiliate panel...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            {currentUser.name?.[0] || 'A'}
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>Affiliate Dashboard</h1>
            <p style={styles.subtitle}>Manage your tradeline cards and track commissions</p>
          </div>
        </div>
        <button 
          style={styles.cardRegButton}
          onClick={openCardRegistration}
          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Card Registration
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Total Cards</span>
            <div style={styles.statIcon}>
              <CreditCard style={{ width: '20px', height: '20px', color: '#6b7280' }} />
            </div>
          </div>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statSubtext}>All registered cards</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Under Review</span>
            <div style={styles.statIcon}>
              <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
          </div>
          <div style={styles.statValue}>{stats.under_review}</div>
          <div style={styles.statSubtext}>Pending admin approval</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Accepted</span>
            <div style={styles.statIcon}>
              <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
          </div>
          <div style={styles.statValue}>{stats.accepted}</div>
          <div style={styles.statSubtext}>Approved and available</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Assigned</span>
            <div style={styles.statIcon}>
              <Users style={{ width: '20px', height: '20px', color: '#22c55e' }} />
            </div>
          </div>
          <div style={styles.statValue}>{stats.assigned}</div>
          <div style={styles.statSubtext}>Currently rented</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Total Earnings</span>
            <div style={styles.statIcon}>
              <DollarSign style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
          </div>
          <div style={styles.statValue}>${stats.totalCommissions.toFixed(2)}</div>
          <div style={styles.statSubtext}>All-time commissions</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Pending Payout</span>
            <div style={styles.statIcon}>
              <TrendingUp style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
          </div>
          <div style={styles.statValue}>${stats.pendingCommissions.toFixed(2)}</div>
          <div style={styles.statSubtext}>Awaiting payment</div>
        </div>
      </div>

      {/* Cards Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Tradeline Cards</h2>
        </div>

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

      {/* Commissions Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Commission History</h2>
        </div>

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
    </div>
  );
};

export default AffiliatePanel;
