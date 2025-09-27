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
  TrendingUp,
  DollarSign,
  CreditCard,
  Archive,
  Shield
} from 'lucide-react';
import { supabase } from "../lib/supabase";

const ClientManagement = ({ currentUser }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Estados del pipeline para clientes según tu definición
  const clientStatusConfig = {
    new_lead: {
      label: 'Nuevo Cliente',
      color: '#6b7280',
      bgColor: '#f9fafb',
      textColor: '#374151',
      icon: Users,
      nextStatus: 'contacted',
      stage: 1
    },
    contacted: {
      label: 'Contactado',
      color: '#f59e0b', 
      bgColor: '#fef3c7',
      textColor: '#92400e',
      icon: Phone,
      nextStatus: 'qualification',
      stage: 2
    },
    qualification: {
      label: 'En Calificación',
      color: '#f59e0b',
      bgColor: '#fef3c7', 
      textColor: '#92400e',
      icon: Eye,
      nextStatus: 'proposal',
      stage: 2
    },
    proposal: {
      label: 'Propuesta Enviada',
      color: '#eab308',
      bgColor: '#fefce8',
      textColor: '#a16207',
      icon: Mail,
      nextStatus: 'negotiation',
      stage: 3
    },
    negotiation: {
      label: 'En Negociación',
      color: '#eab308',
      bgColor: '#fefce8',
      textColor: '#a16207',
      icon: TrendingUp,
      nextStatus: 'approved',
      stage: 3
    },
    approved: {
      label: 'Aprobado',
      color: '#10b981',
      bgColor: '#d1fae5',
      textColor: '#065f46',
      icon: CheckCircle,
      nextStatus: 'active',
      stage: 4
    },
    active: {
      label: 'Tradeline Activa',
      color: '#22c55e',
      bgColor: '#dcfce7',
      textColor: '#166534',
      icon: CreditCard,
      nextStatus: null,
      stage: 5
    },
    vigencia_60: {
      label: 'Vigencia 60 días',
      color: '#84cc16',
      bgColor: '#ecfccb',
      textColor: '#365314',
      icon: Clock,
      nextStatus: 'expired',
      stage: 5
    },
    expired: {
      label: 'Tradeline Caducada',
      color: '#16a34a',
      bgColor: '#f0fdf4',
      textColor: '#14532d',
      icon: Archive,
      nextStatus: null,
      stage: 6
    },
    blacklist: {
      label: 'Lista Negra',
      color: '#000000',
      bgColor: '#f3f4f6',
      textColor: '#111827',
      icon: Shield,
      nextStatus: null,
      stage: 7
    }
  };

  // Cargar datos
  useEffect(() => {
    fetchClients();
  }, []);

const fetchClients = async () => {
  try {
    let query = supabase
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
      .eq('archived', false)
      .order('created_at', { ascending: false });

    // Si el usuario es un broker, filtrar solo sus clientes
    if (currentUser && currentUser.role === 'broker') {
      // Primero obtener el ID del broker
      const { data: brokerData, error: brokerError } = await supabase
        .from('brokers')
        .select('id')
        .eq('email', currentUser.email)
        .single();

      if (brokerError) {
        console.error('Error fetching broker ID:', brokerError);
        setClients([]);
        setLoading(false);
        return;
      }

      if (brokerData) {
        // Filtrar solo los clientes asignados a este broker
        query = query.eq('assigned_broker_id', brokerData.id);
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    setClients(data || []);
  } catch (error) {
    console.error('Error fetching clients:', error);
    setClients([]);
  } finally {
    setLoading(false);
  }
};

  // Cambiar estado del cliente - solo admins pueden cambiar estados
  const updateClientStatus = async (clientId, newStatus) => {
    if (currentUser.role !== 'admin') {
      alert('Solo los administradores pueden cambiar el estado del cliente');
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: newStatus,
          last_activity: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;
      
      // Actualizar estado local
      setClients(clients.map(client => 
        client.id === clientId 
          ? { ...client, status: newStatus, last_activity: new Date().toISOString() }
          : client
      ));
      
      alert(`Estado del cliente actualizado a ${clientStatusConfig[newStatus]?.label || newStatus}`);
    } catch (error) {
      console.error('Error updating client status:', error);
      alert('Error actualizando el estado del cliente');
    }
  };

  // Mover a lista negra - solo admins
  const moveToBlacklist = async (clientId) => {
    if (currentUser.role !== 'admin') {
      alert('Solo los administradores pueden mover clientes a lista negra');
      return;
    }

    const confirmed = confirm('¿Estás seguro de que quieres mover este cliente a la lista negra? Esta acción debe usarse con cuidado.');
    if (!confirmed) return;

    await updateClientStatus(clientId, 'blacklist');
  };

  // Ver detalles del cliente - para ambos roles
  const viewClientDetails = (client) => {
    // Aquí puedes implementar un modal o navegación a vista detallada
    alert(`Ver detalles de ${client.first_name} ${client.last_name}\nID: ${client.custom_id}\nEstado: ${clientStatusConfig[client.status]?.label}`);
  };

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    if (filter === 'all') return true;
    if (filter === 'my_clients' && currentUser.role === 'broker') {
      return client.assigned_broker_id === currentUser.id;
    }
    return client.status === filter;
  });

  // Estadísticas
  const getStats = () => {
    const stats = {
      total: clients.length,
      new_lead: clients.filter(c => c.status === 'new_lead').length,
      contacted: clients.filter(c => c.status === 'contacted').length,
      approved: clients.filter(c => c.status === 'approved').length,
      active: clients.filter(c => c.status === 'active').length,
      blacklist: clients.filter(c => c.status === 'blacklist').length
    };
    return stats;
  };

  const stats = getStats();

  // Obtener información de quién creó el cliente
  const getCreatorInfo = (client) => {
    if (client.created_by_type === 'admin') {
      return `Creado por ${client.created_by}`;
    } else if (client.created_by_type === 'broker' && client.brokers) {
      return `Creado por Broker ${client.brokers.first_name} ${client.brokers.last_name} (${client.brokers.custom_id})`;
    } else if (client.brokers) {
      return `Asignado a Broker ${client.brokers.first_name} ${client.brokers.last_name} (${client.brokers.custom_id})`;
    }
    return client.created_by || 'Sistema';
  };

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
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      textAlign: 'center'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statValue: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '8px 0 0 0'
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
    clientsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '20px'
    },
    clientCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s'
    },
    clientHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    clientInfo: {
      flex: 1
    },
    clientName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    clientId: {
      fontSize: '13px',
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
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    clientDetails: {
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
    creatorInfo: {
      fontSize: '12px',
      color: '#059669',
      fontWeight: '500',
      marginTop: '8px',
      padding: '6px 10px',
      backgroundColor: '#f0fdf4',
      borderRadius: '6px'
    },
    actionsContainer: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '6px 10px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '11px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
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
    warningButton: {
      backgroundColor: '#f59e0b',
      color: 'white'
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '60px' }}>
        <Clock style={{ width: '48px', height: '48px', color: '#6b7280' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Gestión del Pipeline de Clientes</h2>
          <p style={styles.subtitle}>Seguimiento de clientes a través de todas las etapas del pipeline</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Clientes</p>
          <p style={styles.statValue}>{stats.total}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Nuevos Leads</p>
          <p style={styles.statValue}>{stats.new_lead}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Contactados</p>
          <p style={styles.statValue}>{stats.contacted}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Aprobados</p>
          <p style={styles.statValue}>{stats.approved}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Activos</p>
          <p style={styles.statValue}>{stats.active}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Lista Negra</p>
          <p style={styles.statValue}>{stats.blacklist}</p>
        </div>
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
          Todos los Clientes
        </button>
        {currentUser.role === 'broker' && (
          <button
            onClick={() => setFilter('my_clients')}
            style={{
              ...styles.filterButton,
              ...(filter === 'my_clients' ? styles.filterButtonActive : {})
            }}
          >
            Mis Clientes
          </button>
        )}
        {Object.entries(clientStatusConfig).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              ...styles.filterButton,
              ...(filter === status ? styles.filterButtonActive : {})
            }}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Clients Grid */}
      <div style={styles.clientsGrid}>
        {filteredClients.map(client => {
          const statusConfig = clientStatusConfig[client.status] || clientStatusConfig.new_lead;
          const StatusIcon = statusConfig.icon;

          return (
            <div 
              key={client.id} 
              style={{
                ...styles.clientCard,
                borderLeft: `4px solid ${statusConfig.color}`
              }}
            >
              {/* Header */}
              <div style={styles.clientHeader}>
                <div style={styles.clientInfo}>
                  <h3 style={styles.clientName}>
                    {client.first_name} {client.last_name}
                  </h3>
                  <p style={styles.clientId}>ID: {client.custom_id}</p>
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
              <div style={styles.clientDetails}>
                <div style={styles.detailItem}>
                  <Mail style={{ width: '14px', height: '14px' }} />
                  {client.email}
                </div>
                <div style={styles.detailItem}>
                  <Phone style={{ width: '14px', height: '14px' }} />
                  {client.phone || 'Sin teléfono'}
                </div>
                <div style={styles.detailItem}>
                  <Calendar style={{ width: '14px', height: '14px' }} />
                  Creado: {new Date(client.created_at).toLocaleDateString()}
                </div>
                <div style={styles.detailItem}>
                  <Clock style={{ width: '14px', height: '14px' }} />
                  Última actividad: {client.last_activity ? new Date(client.last_activity).toLocaleDateString() : 'Sin actividad'}
                </div>

                {/* Creator Info */}
                <div style={styles.creatorInfo}>
                  {getCreatorInfo(client)}
                </div>
              </div>

              {/* Actions - Solo admins pueden cambiar estados */}
              {currentUser.role === 'admin' && (
                <div style={styles.actionsContainer}>
                  {/* Botón siguiente estado */}
                  {statusConfig.nextStatus && (
                    <button
                      onClick={() => updateClientStatus(client.id, statusConfig.nextStatus)}
                      style={{...styles.actionButton, ...styles.successButton}}
                    >
                      <CheckCircle style={{ width: '12px', height: '12px' }} />
                      Mover a {clientStatusConfig[statusConfig.nextStatus]?.label}
                    </button>
                  )}
                  
                  {/* Botón lista negra */}
                  {client.status !== 'blacklist' && (
                    <button
                      onClick={() => moveToBlacklist(client.id)}
                      style={{...styles.actionButton, ...styles.dangerButton}}
                    >
                      <Shield style={{ width: '12px', height: '12px' }} />
                      Lista Negra
                    </button>
                  )}

                  <button
                    onClick={() => viewClientDetails(client)}
                    style={{...styles.actionButton, ...styles.secondaryButton}}
                  >
                    <Eye style={{ width: '12px', height: '12px' }} />
                    Ver Detalles
                  </button>
                </div>
              )}
              
              {/* Solo vista para brokers */}
              {currentUser.role === 'broker' && (
                <div style={styles.actionsContainer}>
                  <button
                    onClick={() => viewClientDetails(client)}
                    style={{...styles.actionButton, ...styles.secondaryButton}}
                  >
                    <Eye style={{ width: '12px', height: '12px' }} />
                    Ver Detalles
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <AlertTriangle style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px 0' }}>No se encontraron clientes</h3>
          <p style={{ margin: 0 }}>
            {filter === 'all' ? 'No hay clientes registrados aún' : `No hay clientes con estado "${clientStatusConfig[filter]?.label || filter}"`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
