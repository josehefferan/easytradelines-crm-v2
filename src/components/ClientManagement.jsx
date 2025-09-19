import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreHorizontal, Mail, Phone, DollarSign, Calendar, Archive, Eye, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActions, setShowActions] = useState(null);

  const statusConfig = {
    new_lead: { label: 'New Lead', color: '#3b82f6', bgColor: '#eff6ff', textColor: '#1e40af' },
    contacted: { label: 'Contacted', color: '#f59e0b', bgColor: '#fffbeb', textColor: '#d97706' },
    qualification: { label: 'Qualification', color: '#8b5cf6', bgColor: '#f3f4f6', textColor: '#7c3aed' },
    proposal: { label: 'Proposal', color: '#06b6d4', bgColor: '#ecfeff', textColor: '#0891b2' },
    negotiation: { label: 'Negotiation', color: '#f97316', bgColor: '#fff7ed', textColor: '#ea580c' },
    approved: { label: 'Approved', color: '#10b981', bgColor: '#ecfdf5', textColor: '#059669' },
    active: { label: 'Active', color: '#059669', bgColor: '#d1fae5', textColor: '#047857' },
    blacklist: { label: 'Blacklist', color: '#ef4444', bgColor: '#fef2f2', textColor: '#dc2626' }
  };

  // Cargar clientes desde Supabase
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          broker:broker_id(first_name, last_name),
          affiliate:affiliate_id(first_name, last_name)
        `)
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

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Archivar cliente
  const archiveClient = async (clientId) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          archived: true, 
          archive_date: new Date().toISOString(),
          original_status: clients.find(c => c.id === clientId)?.status
        })
        .eq('id', clientId);

      if (error) throw error;
      
      // Actualizar estado local
      setClients(clients.filter(c => c.id !== clientId));
      setShowActions(null);
    } catch (error) {
      console.error('Error archiving client:', error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formatear monto
  const formatAmount = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const styles = {
    container: {
      padding: '32px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: 0
    },
    controls: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    searchContainer: {
      position: 'relative',
      flex: '1',
      minWidth: '250px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 12px 12px 40px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b'
    },
    select: {
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    cardHeader: {
      padding: '24px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    cardIcon: {
      color: '#6366f1'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: '16px 24px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    },
    td: {
      padding: '16px 24px',
      borderBottom: '1px solid #e5e7eb',
      verticalAlign: 'middle'
    },
    clientName: {
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '4px'
    },
    clientContact: {
      fontSize: '14px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '2px'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    },
    amount: {
      fontWeight: '600',
      color: '#059669'
    },
    actionButton: {
      position: 'relative'
    },
    actionIcon: {
      padding: '8px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color: '#64748b',
      transition: 'all 0.2s'
    },
    actionMenu: {
      position: 'absolute',
      right: '0',
      top: '100%',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      minWidth: '150px',
      zIndex: 1000
    },
    actionItem: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '14px',
      color: '#374151',
      border: 'none',
      backgroundColor: 'transparent',
      width: '100%',
      textAlign: 'left'
    },
    loadingContainer: {
      padding: '60px',
      textAlign: 'center',
      color: '#64748b'
    },
    emptyContainer: {
      padding: '60px',
      textAlign: 'center',
      color: '#64748b'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#374151'
    },
    emptyText: {
      fontSize: '14px',
      marginBottom: '16px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Loading clients...
          </div>
          <div>Please wait while we fetch your client data.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Client Management</h1>
        <p style={styles.subtitle}>Manage all clients and tradelines</p>
      </div>

      <div style={styles.controls}>
        <div style={styles.searchContainer}>
          <Search style={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([status, config]) => (
            <option key={status} value={status}>{config.label}</option>
          ))}
        </select>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Users style={styles.cardIcon} size={24} />
          <h2 style={styles.cardTitle}>
            Clients ({filteredClients.length})
          </h2>
        </div>

        {filteredClients.length === 0 ? (
          <div style={styles.emptyContainer}>
            <div style={styles.emptyTitle}>
              {searchTerm || statusFilter !== 'all' ? 'No clients found' : 'No clients yet'}
            </div>
            <div style={styles.emptyText}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first client to get started.'
              }
            </div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Client</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Broker</th>
                <th style={styles.th}>Affiliate</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td style={styles.td}>
                    <div style={styles.clientName}>
                      {client.first_name} {client.last_name}
                    </div>
                    <div style={styles.clientContact}>
                      <Mail size={14} />
                      {client.email}
                    </div>
                    <div style={styles.clientContact}>
                      <Phone size={14} />
                      {client.phone}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: statusConfig[client.status]?.bgColor || '#f3f4f6',
                        color: statusConfig[client.status]?.textColor || '#374151'
                      }}
                    >
                      {statusConfig[client.status]?.label || client.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {client.broker ? (
                      `${client.broker.first_name} ${client.broker.last_name}`
                    ) : (
                      <span style={{ color: '#9ca3af' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {client.affiliate ? (
                      `${client.affiliate.first_name} ${client.affiliate.last_name}`
                    ) : (
                      <span style={{ color: '#9ca3af' }}>None</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.amount}>
                      {formatAmount(client.estimated_amount)}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {formatDate(client.created_at)}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButton}>
                      <button
                        style={{
                          ...styles.actionIcon,
                          backgroundColor: showActions === client.id ? '#f1f5f9' : 'transparent'
                        }}
                        onClick={() => setShowActions(showActions === client.id ? null : client.id)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {showActions === client.id && (
                        <div style={styles.actionMenu}>
                          <button style={styles.actionItem}>
                            <Eye size={16} />
                            View Details
                          </button>
                          <button style={styles.actionItem}>
                            <Edit size={16} />
                            Edit Client
                          </button>
                          <button 
                            style={{ ...styles.actionItem, color: '#dc2626' }}
                            onClick={() => archiveClient(client.id)}
                          >
                            <Archive size={16} />
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;
