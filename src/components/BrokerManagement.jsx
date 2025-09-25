import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Edit,
  Trash2,
  UserCheck,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { supabase } from "../lib/supabase";

const BrokerManagement = ({ currentUser }) => {
  const [brokers, setBrokers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [filter, setFilter] = useState('all');

  // Estados del pipeline para brokers
  const brokerStatusConfig = {
    registered: {
      label: 'Registered',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      textColor: '#1d4ed8',
      icon: Clock,
      nextStatus: 'validated'
    },
    validated: {
      label: 'Validated', 
      color: '#eab308',
      bgColor: '#fefce8',
      textColor: '#a16207',
      icon: CheckCircle,
      nextStatus: 'active'
    },
    active: {
      label: 'Active',
      color: '#22c55e',
      bgColor: '#f0fdf4', 
      textColor: '#15803d',
      icon: UserCheck,
      nextStatus: null
    },
    suspended: {
      label: 'Suspended',
      color: '#ef4444',
      bgColor: '#fef2f2',
      textColor: '#dc2626',
      icon: XCircle,
      nextStatus: 'active'
    }
  };

  const clientStatusConfig = {
    new_lead: { label: 'New Lead', color: '#3b82f6', icon: Users },
    contacted: { label: 'Contacted', color: '#eab308', icon: Phone },
    qualification: { label: 'In Qualification', color: '#a855f7', icon: Eye },
    proposal: { label: 'Proposal Sent', color: '#06b6d4', icon: Mail },
    negotiation: { label: 'In Negotiation', color: '#f59e0b', icon: TrendingUp },
    approved: { label: 'Approved', color: '#10b981', icon: CheckCircle },
    active: { label: 'Active', color: '#22c55e', icon: UserCheck },
    blacklist: { label: 'Blacklisted', color: '#ef4444', icon: XCircle }
  };

  // Cargar datos
  useEffect(() => {
    fetchBrokers();
    fetchClients();
  }, []);

  const fetchBrokers = async () => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBrokers(data || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          brokers (
            id,
            custom_id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Cambiar estado del broker
  const updateBrokerStatus = async (brokerId, newStatus) => {
    try {
      const { error } = await supabase
        .from('brokers')
        .update({ status: newStatus })
        .eq('id', brokerId);

      if (error) throw error;
      
      // Actualizar estado local
      setBrokers(brokers.map(broker => 
        broker.id === brokerId 
          ? { ...broker, status: newStatus }
          : broker
      ));
      
      alert(`Broker status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating broker status:', error);
      alert('Error updating broker status');
    }
  };

  // Filtrar brokers
  const filteredBrokers = brokers.filter(broker => {
    if (filter === 'all') return true;
    return broker.status === filter;
  });

  // Obtener clientes de un broker específico
  const getBrokerClients = (brokerId) => {
    return clients.filter(client => client.broker_id === brokerId);
  };

  // Estadísticas
  const getStats = () => {
    const stats = {
      total: brokers.length,
      registered: brokers.filter(b => b.status === 'registered').length,
      validated: brokers.filter(b => b.status === 'validated').length,
      active: brokers.filter(b => b.status === 'active').length,
      suspended: brokers.filter(b => b.status === 'suspended').length,
      totalClients: clients.length
    };
    return stats;
  };

  const stats = getStats();

  const styles = {
    container: {
      padding: '24px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    subtitle: {
      color: '#6b7280',
      marginTop: '4px',
      fontSize: '16px'
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
      border: '1px solid #e5e7eb'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '8px 0 0 0'
    },
    filtersContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s'
    },
    filterButtonActive: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    brokersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '24px'
    },
    brokerCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    brokerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    brokerInfo: {
      flex: 1
    },
    brokerName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    brokerId: {
      fontSize: '14px',
      color: '#6b7280',
      fontFamily: 'monospace',
      marginTop: '4px'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500'
    },
    brokerDetails: {
      marginBottom: '16px'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#6b7280'
    },
    actionsContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    dangerButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    successButton: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    clientsSection: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    clientsList: {
      marginTop: '12px'
    },
    clientItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      fontSize: '14px'
    },
    clientName: {
      color: '#1f2937',
      fontWeight: '500'
    },
    clientStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '60px' }}>
        <Clock style={{ width: '48px', height: '48px', color: '#6b7280' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading brokers...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Broker Management</h2>
          <p style={styles.subtitle}>Admin Pipeline - Validate and manage broker access</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Brokers</p>
          <p style={styles.statValue}>{stats.total}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Registered</p>
          <p style={styles.statValue}>{stats.registered}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Validated</p>
          <p style={styles.statValue}>{stats.validated}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Active</p>
          <p style={styles.statValue}>{stats.active}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Clients</p>
          <p style={styles.statValue}>{stats.totalClients}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        {['all', 'registered', 'validated', 'active', 'suspended'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              ...styles.filterButton,
              ...(filter === status ? styles.filterButtonActive : {})
            }}
          >
            {status === 'all' ? 'All Brokers' : brokerStatusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Brokers Grid */}
      <div style={styles.brokersGrid}>
        {filteredBrokers.map(broker => {
          const statusConfig = brokerStatusConfig[broker.status] || brokerStatusConfig.registered;
          const StatusIcon = statusConfig.icon;
          const brokerClients = getBrokerClients(broker.id);

          return (
            <div key={broker.id} style={styles.brokerCard}>
              {/* Header */}
              <div style={styles.brokerHeader}>
                <div style={styles.brokerInfo}>
                  <h3 style={styles.brokerName}>
                    {broker.first_name} {broker.last_name}
                  </h3>
                  <p style={styles.brokerId}>ID: {broker.custom_id}</p>
                </div>
                <div
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: statusConfig.bgColor,
                    color: statusConfig.textColor
                  }}
                >
                  <StatusIcon style={{ width: '14px', height: '14px' }} />
                  {statusConfig.label}
                </div>
              </div>

              {/* Details */}
              <div style={styles.brokerDetails}>
                <div style={styles.detailItem}>
                  <Mail style={{ width: '16px', height: '16px' }} />
                  {broker.email}
                </div>
                <div style={styles.detailItem}>
                  <Phone style={{ width: '16px', height: '16px' }} />
                  {broker.phone || 'No phone'}
                </div>
                <div style={styles.detailItem}>
                  <Building2 style={{ width: '16px', height: '16px' }} />
                  {broker.company_name || 'No company'}
                </div>
                <div style={styles.detailItem}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  Registered: {new Date(broker.created_at).toLocaleDateString()}
                </div>
                <div style={styles.detailItem}>
                  <Users style={{ width: '16px', height: '16px' }} />
                  {brokerClients.length} clients
                </div>
              </div>

              {/* Actions */}
              <div style={styles.actionsContainer}>
                {broker.status === 'registered' && (
                  <button
                    onClick={() => updateBrokerStatus(broker.id, 'validated')}
                    style={{...styles.actionButton, ...styles.successButton}}
                  >
                    <CheckCircle style={{ width: '14px', height: '14px' }} />
                    Validate
                  </button>
                )}
                
                {broker.status === 'validated' && (
                  <button
                    onClick={() => updateBrokerStatus(broker.id, 'active')}
                    style={{...styles.actionButton, ...styles.primaryButton}}
                  >
                    <UserCheck style={{ width: '14px', height: '14px' }} />
                    Activate
                  </button>
                )}
                
                {broker.status === 'active' && (
                  <button
                    onClick={() => updateBrokerStatus(broker.id, 'suspended')}
                    style={{...styles.actionButton, ...styles.dangerButton}}
                  >
                    <XCircle style={{ width: '14px', height: '14px' }} />
                    Suspend
                  </button>
                )}
                
                {broker.status === 'suspended' && (
                  <button
                    onClick={() => updateBrokerStatus(broker.id, 'active')}
                    style={{...styles.actionButton, ...styles.successButton}}
                  >
                    <UserCheck style={{ width: '14px', height: '14px' }} />
                    Reactivate
                  </button>
                )}

                <button
                  onClick={() => setSelectedBroker(broker)}
                  style={{...styles.actionButton, ...styles.secondaryButton}}
                >
                  <Eye style={{ width: '14px', height: '14px' }} />
                  View Details
                </button>
              </div>

              {/* Clients Section */}
              {brokerClients.length > 0 && (
                <div style={styles.clientsSection}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                    Recent Clients ({brokerClients.length})
                  </h4>
                  <div style={styles.clientsList}>
                    {brokerClients.slice(0, 3).map(client => {
                      const clientStatus = clientStatusConfig[client.status] || clientStatusConfig.new_lead;
                      return (
                        <div key={client.id} style={styles.clientItem}>
                          <span style={styles.clientName}>
                            {client.first_name} {client.last_name} ({client.custom_id})
                          </span>
                          <div
                            style={{
                              ...styles.clientStatus,
                              backgroundColor: `${clientStatus.color}20`,
                              color: clientStatus.color
                            }}
                          >
                            {clientStatus.label}
                          </div>
                        </div>
                      );
                    })}
                    {brokerClients.length > 3 && (
                      <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', margin: '8px 0 0 0' }}>
                        +{brokerClients.length - 3} more clients
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredBrokers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <AlertTriangle style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px 0' }}>No brokers found</h3>
          <p style={{ margin: 0 }}>
            {filter === 'all' ? 'No brokers registered yet' : `No brokers with status "${filter}"`}
          </p>
        </div>
      )}
    </div>
  );
};

export default BrokerManagement;
