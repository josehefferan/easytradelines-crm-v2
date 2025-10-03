import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { supabase } from "../lib/supabase";
import ContractSignaturePopup from './ContractSignaturePopup';

const BrokerManagement = ({ currentUser }) => {
  const [brokers, setBrokers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showContractForBroker, setShowContractForBroker] = useState(null);

  // Estados del pipeline para brokers
  const brokerStatusConfig = {
    pending: {
      label: 'Pending Approval',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      textColor: '#d97706',
      icon: AlertCircle,
      nextStatus: 'active'
    },
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
      icon: CheckCircle,
      nextStatus: null
    },
    suspended: {
      label: 'Suspended',
      color: '#ef4444',
      bgColor: '#fef2f2',
      textColor: '#dc2626',
      icon: XCircle,
      nextStatus: 'active'
    },
    rejected: {
      label: 'Rejected',
      color: '#991b1b',
      bgColor: '#fee2e2',
      textColor: '#991b1b',
      icon: XCircle,
      nextStatus: null
    }
  };

  const clientStatusConfig = {
    new_lead: { label: 'New Lead', color: '#3b82f6', icon: Users },
    contacted: { label: 'Contacted', color: '#eab308', icon: Phone },
    qualification: { label: 'In Qualification', color: '#a855f7', icon: Eye },
    proposal: { label: 'Proposal Sent', color: '#06b6d4', icon: Mail },
    negotiation: { label: 'In Negotiation', color: '#f59e0b', icon: TrendingUp },
    approved: { label: 'Approved', color: '#10b981', icon: CheckCircle },
    active: { label: 'Active', color: '#22c55e', icon: CheckCircle },
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

  // Aprobar broker
  const approveBroker = async (brokerId) => {
    if (!confirm('Are you sure you want to approve this broker?')) return;
    
    try {
      const { error } = await supabase
        .from('brokers')
        .update({ 
          status: 'active',
          active: true
        })
        .eq('id', brokerId);

      if (error) throw error;
      
      setBrokers(brokers.map(broker => 
        broker.id === brokerId 
          ? { ...broker, status: 'active', active: true }
          : broker
      ));
      
      alert('Broker approved successfully!');
    } catch (error) {
      console.error('Error approving broker:', error);
      alert('Error approving broker');
    }
  };

  // Rechazar broker
  const rejectBroker = async (brokerId) => {
    if (!confirm('Are you sure you want to reject this broker? This action will mark them as rejected.')) return;
    
    try {
      const { error } = await supabase
        .from('brokers')
        .update({ 
          status: 'rejected',
          active: false
        })
        .eq('id', brokerId);

      if (error) throw error;
      
      setBrokers(brokers.map(broker => 
        broker.id === brokerId 
          ? { ...broker, status: 'rejected', active: false }
          : broker
      ));
      
      alert('Broker rejected');
    } catch (error) {
      console.error('Error rejecting broker:', error);
      alert('Error rejecting broker');
    }
  };

  // Cambiar estado del broker
  const updateBrokerStatus = async (brokerId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'active') {
        updateData.active = true;
      } else if (newStatus === 'suspended') {
        updateData.active = false;
      }

      const { error } = await supabase
        .from('brokers')
        .update(updateData)
        .eq('id', brokerId);

      if (error) throw error;
      
      setBrokers(brokers.map(broker => 
        broker.id === brokerId 
          ? { ...broker, ...updateData }
          : broker
      ));
      
      alert(`Broker status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating broker status:', error);
      alert('Error updating broker status');
    }
  };

  // Validar documentos del broker
  const validateBrokerDocuments = async (brokerId) => {
    if (!confirm('Are you sure you want to validate this broker\'s documents? This will allow them to create clients.')) return;
    
    try {
      const { error } = await supabase
        .from('brokers')
        .update({ 
          documents_validated: true,
          documents_validated_by: currentUser.email,
          documents_validated_date: new Date().toISOString()
        })
        .eq('id', brokerId);

      if (error) throw error;
      
      setBrokers(brokers.map(broker => 
        broker.id === brokerId 
          ? { ...broker, documents_validated: true, documents_validated_by: currentUser.email, documents_validated_date: new Date().toISOString() }
          : broker
      ));
      
      alert('Documents validated successfully! Broker can now create clients.');
    } catch (error) {
      console.error('Error validating documents:', error);
      alert('Error validating documents');
    }
  };

  // Filtrar brokers
  const filteredBrokers = brokers.filter(broker => {
    if (filter === 'all') return true;
    if (filter === 'pending') return broker.status === 'pending';
    return broker.status === filter;
  });

  // Obtener clientes de un broker específico
  const getBrokerClients = (brokerId) => {
    return clients.filter(client => client.assigned_broker_id === brokerId);
  };

  // Estadísticas
  const getStats = () => {
    const stats = {
      total: brokers.length,
      pending: brokers.filter(b => b.status === 'pending').length,
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
    pendingCard: {
      border: '2px solid #f59e0b',
      backgroundColor: '#fffbeb'
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
    approveButton: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    rejectButton: {
      backgroundColor: '#ef4444',
      color: 'white'
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
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Clock style={{ width: '48px', height: '48px', color: '#6b7280' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading brokers...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Alerta de pendientes */}
      {stats.pending > 0 && (
        <div style={styles.pendingAlert}>
          <AlertCircle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
          <div>
            <strong style={{ color: '#92400e' }}>
              {stats.pending} broker{stats.pending > 1 ? 's' : ''} pending approval
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#92400e' }}>
              Review and approve new broker registrations
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Brokers</p>
          <p style={styles.statValue}>{stats.total}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Pending Approval</p>
          <p style={{...styles.statValue, color: '#f59e0b'}}>{stats.pending}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Registered</p>
          <p style={styles.statValue}>{stats.registered}</p>
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
        {['all', 'pending', 'registered', 'validated', 'active', 'suspended'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              ...styles.filterButton,
              ...(filter === status ? styles.filterButtonActive : {})
            }}
          >
            {status === 'all' ? 'All Brokers' : status === 'pending' ? 'Pending Approval' : brokerStatusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Brokers Grid */}
      <div style={styles.brokersGrid}>
        {filteredBrokers.map(broker => {
          const statusConfig = brokerStatusConfig[broker.status] || brokerStatusConfig.registered;
          const StatusIcon = statusConfig.icon;
          const brokerClients = getBrokerClients(broker.id);
          const isPending = broker.status === 'pending';

          return (
            <div key={broker.id} style={{
              ...styles.brokerCard,
              ...(isPending ? styles.pendingCard : {})
            }}>
              {/* Header */}
              <div style={styles.brokerHeader}>
                <div style={styles.brokerInfo}>
                  <h3 style={styles.brokerName}>
                    {broker.first_name} {broker.last_name}
                  </h3>
                  <p style={styles.brokerId}>ID: {broker.custom_id || broker.id.slice(0, 8)}</p>
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
                {/* Indicador de documentos pendientes */}
                {broker.contract_signed && broker.driver_license_uploaded && !broker.documents_validated && (
                  <div style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#92400e',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle style={{ width: '14px', height: '14px' }} />
                    Documents submitted - pending validation
                  </div>
                )}

                {/* Indicador de documentos validados */}
                {broker.documents_validated && (
                  <div style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#059669',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle style={{ width: '14px', height: '14px' }} />
                    Documents validated by {broker.documents_validated_by?.split('@')[0]}
                  </div>
                )}

                {/* Botón Validate Documents - solo si hay docs sin validar */}
                {broker.contract_signed && broker.driver_license_uploaded && !broker.documents_validated && (
                  <button
                    onClick={() => validateBrokerDocuments(broker.id)}
                    style={{...styles.actionButton, ...styles.primaryButton}}
                  >
                    <CheckCircle style={{ width: '14px', height: '14px' }} />
                    Validate Documents
                  </button>
                )}

                {/* Botones para PENDING */}
                {broker.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveBroker(broker.id)}
                      style={{...styles.actionButton, ...styles.approveButton}}
                    >
                      <CheckCircle style={{ width: '14px', height: '14px' }} />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectBroker(broker.id)}
                      style={{...styles.actionButton, ...styles.rejectButton}}
                    >
                      <XCircle style={{ width: '14px', height: '14px' }} />
                      Reject
                    </button>
                  </>
                )}

                {/* Botones para otros estados */}
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
                    <CheckCircle style={{ width: '14px', height: '14px' }} />
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
                    <CheckCircle style={{ width: '14px', height: '14px' }} />
                    Reactivate
                  </button>
                )}

                <button
                  onClick={() => setShowContractForBroker(broker)}
                  style={{...styles.actionButton, ...styles.secondaryButton}}
                >
                  <Eye style={{ width: '14px', height: '14px' }} />
                  View
                </button>
              </div>
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

      {/* Contract Signature Popup */}
      {showContractForBroker && (
        <ContractSignaturePopup
          isOpen={true}
          onClose={() => setShowContractForBroker(null)}
          brokerData={showContractForBroker}
          currentUser={currentUser}
          onSignComplete={async (adminSignatureData) => {
            try {
              const { error } = await supabase
                .from('brokers')
                .update({
                  admin_signature_data: adminSignatureData.signatureImage,
                  admin_name_signed: adminSignatureData.contractData.admin_name,
                  admin_initials_signed: adminSignatureData.contractData.admin_initials,
                  contract_fully_signed: true,
                  contract_fully_signed_date: new Date().toISOString()
                })
                .eq('id', showContractForBroker.id);
              
              if (error) throw error;
              
              alert('Admin signature saved successfully! Contract is now fully signed.');
              setShowContractForBroker(null);
              fetchBrokers();
            } catch (error) {
              console.error('Error saving admin signature:', error);
              alert('Error saving admin signature');
            }
          }}
        />
      )}
    </div>
  );
};

export default BrokerManagement;
