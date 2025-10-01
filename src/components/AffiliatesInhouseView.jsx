import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AffiliatesInhouseView = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('affiliates');
  const [affiliates, setAffiliates] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'affiliates') {
        const { data, error } = await supabase
          .from('affiliates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setAffiliates(data || []);
      } else {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setCards(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveAffiliate = async (affiliateId) => {
    if (!confirm('Are you sure you want to approve this affiliate?')) return;
    
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ 
          status: 'active',
          active: true
        })
        .eq('id', affiliateId);

      if (error) throw error;
      
      setAffiliates(affiliates.map(aff => 
        aff.id === affiliateId 
          ? { ...aff, status: 'active', active: true }
          : aff
      ));
      
      alert('Affiliate approved successfully!');
    } catch (error) {
      console.error('Error approving affiliate:', error);
      alert('Error approving affiliate');
    }
  };

  const rejectAffiliate = async (affiliateId) => {
    if (!confirm('Are you sure you want to reject this affiliate?')) return;
    
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ 
          status: 'rejected',
          active: false
        })
        .eq('id', affiliateId);

      if (error) throw error;
      
      setAffiliates(affiliates.map(aff => 
        aff.id === affiliateId 
          ? { ...aff, status: 'rejected', active: false }
          : aff
      ));
      
      alert('Affiliate rejected');
    } catch (error) {
      console.error('Error rejecting affiliate:', error);
      alert('Error rejecting affiliate');
    }
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: 'calc(100vh - 200px)'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280'
    },
    pendingAlert: {
      backgroundColor: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '0'
    },
    tab: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '2px solid transparent',
      color: '#6b7280',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '-2px'
    },
    tabActive: {
      color: '#16a34a',
      borderBottomColor: '#16a34a',
      backgroundColor: 'transparent'
    },
    contentCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    },
    tableContainer: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      borderBottom: '2px solid #e5e7eb',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '600'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #f3f4f6',
      color: '#6b7280',
      fontSize: '14px'
    },
    badge: {
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    },
    actionButton: {
      padding: '6px 12px',
      backgroundColor: 'transparent',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#6b7280',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s',
      marginRight: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    },
    approveButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none'
    },
    rejectButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px',
      color: '#6b7280'
    },
    pendingRow: {
      backgroundColor: '#fffbeb'
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: { backgroundColor: '#d4edda', color: '#155724' },
      pending: { backgroundColor: '#fef3c7', color: '#d97706' },
      rejected: { backgroundColor: '#fee2e2', color: '#991b1b' },
      inactive: { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    
    return (
      <span style={{ ...styles.badge, ...statusStyles[status] || statusStyles.inactive }}>
        {status || 'pending'}
      </span>
    );
  };

  const calculateStats = () => {
    if (activeTab === 'affiliates') {
      return {
        total: affiliates.length,
        active: affiliates.filter(a => a.status === 'active').length,
        pending: affiliates.filter(a => a.status === 'pending').length
      };
    } else {
      const totalLimit = cards.reduce((sum, card) => sum + (parseFloat(card.account_limit) || 0), 0);
      const totalPayout = cards.reduce((sum, card) => sum + (parseFloat(card.payout) || 0), 0);
      return {
        total: cards.length,
        totalLimit: totalLimit,
        avgPayout: cards.length > 0 ? (totalPayout / cards.length).toFixed(2) : 0
      };
    }
  };

  const stats = calculateStats();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Affiliates & Inhouse List</h1>
        <p style={styles.subtitle}>Manage affiliates and inhouse tradelines</p>
      </div>

      {/* Alerta de pendientes */}
      {activeTab === 'affiliates' && stats.pending > 0 && (
        <div style={styles.pendingAlert}>
          <AlertCircle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
          <div>
            <strong style={{ color: '#92400e' }}>
              {stats.pending} affiliate{stats.pending > 1 ? 's' : ''} pending approval
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#92400e' }}>
              Review and approve new affiliate registrations
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('affiliates')}
          style={{
            ...styles.tab,
            ...(activeTab === 'affiliates' ? styles.tabActive : {})
          }}
        >
          <Users size={20} />
          Affiliates List
        </button>
        <button
          onClick={() => setActiveTab('inhouse')}
          style={{
            ...styles.tab,
            ...(activeTab === 'inhouse' ? styles.tabActive : {})
          }}
        >
          <CreditCard size={20} />
          In-house Cards
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {activeTab === 'affiliates' ? (
          <>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Affiliates</div>
              <div style={styles.statValue}>{stats.total}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Active</div>
              <div style={styles.statValue}>{stats.active}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Pending Approval</div>
              <div style={{...styles.statValue, color: '#f59e0b'}}>{stats.pending}</div>
            </div>
          </>
        ) : (
          <>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Cards</div>
              <div style={styles.statValue}>{stats.total}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Credit Limit</div>
              <div style={styles.statValue}>${stats.totalLimit.toLocaleString()}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Avg Payout</div>
              <div style={styles.statValue}>${stats.avgPayout}</div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div style={styles.contentCard}>
        {loading ? (
          <div style={styles.emptyState}>
            <Clock size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
            <p>Loading...</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            {activeTab === 'affiliates' ? (
              affiliates.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Payment Method</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Joined</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map(affiliate => {
                      const isPending = affiliate.status === 'pending';
                      return (
                        <tr key={affiliate.id} style={isPending ? styles.pendingRow : {}}>
                          <td style={styles.td}>
                            <strong>{affiliate.first_name} {affiliate.last_name}</strong>
                          </td>
                          <td style={styles.td}>{affiliate.email}</td>
                          <td style={styles.td}>{affiliate.phone}</td>
                          <td style={styles.td}>{affiliate.payment_method || 'Not set'}</td>
                          <td style={styles.td}>
                            {getStatusBadge(affiliate.status || 'pending')}
                          </td>
                          <td style={styles.td}>
                            {new Date(affiliate.created_at).toLocaleDateString()}
                          </td>
                          <td style={styles.td}>
                            {isPending ? (
                              <>
                                <button 
                                  style={{...styles.actionButton, ...styles.approveButton}}
                                  onClick={() => approveAffiliate(affiliate.id)}
                                >
                                  <CheckCircle size={14} />
                                  Approve
                                </button>
                                <button 
                                  style={{...styles.actionButton, ...styles.rejectButton}}
                                  onClick={() => rejectAffiliate(affiliate.id)}
                                >
                                  <XCircle size={14} />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <>
                                <button style={styles.actionButton}>
                                  <Eye size={14} />
                                  View
                                </button>
                                <button style={styles.actionButton}>
                                  <Edit size={14} />
                                  Edit
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={styles.emptyState}>
                  <Users size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
                  <p>No affiliates registered yet</p>
                </div>
              )
            ) : (
              cards.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Bank</th>
                      <th style={styles.th}>Account Limit</th>
                      <th style={styles.th}>Open Date</th>
                      <th style={styles.th}>Statement Date</th>
                      <th style={styles.th}>Cycles</th>
                      <th style={styles.th}>Spots</th>
                      <th style={styles.th}>Payout</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map(card => (
                      <tr key={card.id}>
                        <td style={styles.td}>
                          <strong>{card.bank}</strong>
                        </td>
                        <td style={styles.td}>${parseFloat(card.account_limit).toLocaleString()}</td>
                        <td style={styles.td}>{card.open_date}</td>
                        <td style={styles.td}>Day {card.statement_date}</td>
                        <td style={styles.td}>{card.default_cycles}</td>
                        <td style={styles.td}>{card.default_spots}</td>
                        <td style={styles.td}>
                          ${card.payout ? parseFloat(card.payout).toFixed(2) : '0.00'}
                        </td>
                        <td style={styles.td}>
                          {getStatusBadge(card.status)}
                        </td>
                        <td style={styles.td}>
                          <button style={styles.actionButton}>
                            <Eye size={14} />
                            View
                          </button>
                          <button style={styles.actionButton}>
                            <Edit size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.emptyState}>
                  <CreditCard size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
                  <p>No cards registered yet</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>
                    Click "Card Registration" to add a new card
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliatesInhouseView;
