import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Archive,
  Shield,
  Plus,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Pipeline = ({ currentUser }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedClient, setDraggedClient] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Configuración de columnas del pipeline
 const columns = [
  {
    id: 'new_lead',  // Cambiado de 'nuevo_lead'
    title: 'New Leads',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    icon: Plus
  },
  {
    id: 'contacted',  // Cambiado de 'contactado'
    title: 'Contacted',
    color: '#eab308',
    bgColor: '#fefce8',
    icon: Users
  },
  {
    id: 'qualification',  // Cambiado de 'en_validacion'
    title: 'Qualification',
    color: '#a855f7',
    bgColor: '#faf5ff',
    icon: Clock
  },
  {
    id: 'approved',  // Cambiado de 'aprobado'
    title: 'Approved',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    icon: CheckCircle
  },
  {
    id: 'active',  // Cambiado de 'activo'
    title: 'Active',
    color: '#10b981',
    bgColor: '#ecfdf5',
    icon: CheckCircle
  },
  {
    id: 'rejected',  // Cambiado de 'rechazado'
    title: 'Rejected',
    color: '#ef4444',
    bgColor: '#fef2f2',
    icon: XCircle
  }
];

  useEffect(() => {
    loadClients();
  }, [currentUser]);

 const loadClients = async () => {
  try {
    let query = supabase
      .from('clients')
      .select('*')
      .neq('status', 'blacklist')
      .neq('status', 'muerto')
      .order('created_at', { ascending: false });

    // Si es broker, solo cargar sus clientes
    if (currentUser?.role === 'broker') {
      query = query.eq('assigned_broker_id', currentUser.brokerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Log para debug
    console.log('Clients loaded:', data);
    setClients(data || []);
  } catch (error) {
    console.error('Error loading clients:', error);
  } finally {
    setLoading(false);
  }
};

  const handleDragStart = (e, client) => {
    setDraggedClient(client);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedClient || draggedClient.status === newStatus) {
      return;
    }

    try {
      // Actualizar en la base de datos
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggedClient.id);

      if (error) throw error;

      // Actualizar estado local
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === draggedClient.id 
            ? { ...client, status: newStatus }
            : client
        )
      );

      // Registrar actividad
      await supabase.from('activity_log').insert({
        client_id: draggedClient.id,
        user_id: currentUser.email,
        action: 'status_change',
        details: `Status changed from ${draggedClient.status} to ${newStatus}`,
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error updating client status:', error);
      alert('Error updating status. Please try again.');
    }
    
    setDraggedClient(null);
  };

  const getClientsByStatus = (status) => {
    return clients.filter(client => client.status === status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Sales Pipeline
        </h2>
        <p style={{ color: '#6b7280' }}>
          Drag and drop clients to move them through the pipeline
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {columns.map(column => {
          const count = getClientsByStatus(column.id).length;
          const total = getClientsByStatus(column.id)
            .reduce((sum, client) => sum + (client.amount || 0), 0);
          
          return (
            <div key={column.id} style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              borderLeft: `4px solid ${column.color}`
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                {column.title}
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#1f2937'
              }}>
                {count}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280'
              }}>
                {formatCurrency(total)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '24px'
      }}>
        {columns.map(column => {
          const columnClients = getClientsByStatus(column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              style={{
                backgroundColor: isOver ? column.bgColor : '#f9fafb',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '400px',
                transition: 'background-color 0.2s',
                border: isOver ? `2px dashed ${column.color}` : '2px solid transparent'
              }}
            >
              {/* Column Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '8px',
                backgroundColor: column.bgColor,
                borderRadius: '6px'
              }}>
                {React.createElement(column.icon, {
                  style: {
                    width: '16px',
                    height: '16px',
                    color: column.color,
                    marginRight: '8px'
                  }
                })}
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: column.color
                }}>
                  {column.title}
                </h3>
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: 'white',
                  color: column.color,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {columnClients.length}
                </span>
              </div>

              {/* Client Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {columnClients.map(client => (
                  <div
                    key={client.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, client)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      padding: '12px',
                      cursor: 'move',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Client Number */}
                    <div style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      {client.client_number}
                    </div>

                    {/* Client Name */}
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '8px'
                    }}>
                      {client.first_name} {client.last_name}
                    </div>

                    {/* Client Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <Mail style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                        <span style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {client.email}
                        </span>
                      </div>
                      
                      {client.phone && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          <Phone style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                          {client.phone}
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <Calendar style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                        {formatDate(client.created_at)}
                      </div>

                      {client.amount && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#059669',
                          marginTop: '4px'
                        }}>
                          <DollarSign style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                          {formatCurrency(client.amount)}
                        </div>
                      )}
                    </div>

                    {/* Broker Badge */}
                    {client.broker_name && (
                      <div style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#6b7280',
                        display: 'inline-block'
                      }}>
                        {client.broker_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Pipeline;
