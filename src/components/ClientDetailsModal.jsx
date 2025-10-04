import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  CreditCard,
  Building2,
  Shield,
  AlertTriangle,
  Edit,
  ArrowLeft,
  ArrowRight,
  Users
} from 'lucide-react';
import { supabase } from "../lib/supabase";

const ClientDetailsModal = ({ client, isOpen, onClose, onStatusUpdate, currentUser }) => {
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados disponibles para cambios
  const statusOptions = {
    new_lead: { label: 'New Leads', color: '#6b7280', icon: Users },
    contacted: { label: 'Contacted', color: '#f59e0b', icon: Phone },
    qualification: { label: 'Qualification', color: '#8b5cf6', icon: Eye },
    approved: { label: 'Approved', color: '#10b981', icon: CheckCircle },
    active: { label: 'Active', color: '#22c55e', icon: CreditCard },
    rejected: { label: 'Rejected', color: '#ef4444', icon: XCircle }
  };

  // Definir el flujo del pipeline
  const pipelineFlow = ['new_lead', 'contacted', 'qualification', 'approved', 'active'];

  useEffect(() => {
    if (isOpen && client) {
      fetchClientDocuments();
      setNotes(client.admin_notes || '');
    }
  }, [isOpen, client]);

  const handleBrokerFileUpload = async (file, fileType) => {
  if (!file) return;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${client.id}/${fileType}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('client-documents')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('client-documents')
      .getPublicUrl(fileName);

    // Actualizar cliente
    const { error: updateError } = await supabase
      .from('clients')
      .update({ [`${fileType}_url`]: publicUrl })
      .eq('id', client.id);

    if (updateError) throw updateError;

    alert('Document uploaded successfully!');
    fetchClientDocuments(); // Recargar documentos
    
  } catch (error) {
    console.error('Error uploading:', error);
    alert('Error uploading document: ' + error.message);
  }
};

  const fetchClientDocuments = async () => {
    try {
      // Obtener archivos del storage de Supabase
      const { data: files, error } = await supabase.storage
        .from('client-documents')
        .list(`${client.id}/`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
        return;
      }

      setDocuments(files || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  const downloadDocument = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('client-documents')
        .download(`${client.id}/${fileName}`);

      if (error) throw error;

      // Crear URL para descargar
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error downloading document: ' + error.message);
    }
  };

  const viewDocument = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('client-documents')
        .createSignedUrl(`${client.id}/${fileName}`, 3600); // 1 hora

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      alert('Error viewing document: ' + error.message);
    }
  };

  const updateClientStatus = async (newStatus) => {
    if (currentUser.role !== 'admin') {
      alert('Only administrators can change client status');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: newStatus,
          last_activity: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', client.id);

      if (error) throw error;

      alert(`Client status updated to ${statusOptions[newStatus]?.label}`);
      onStatusUpdate(client.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating client status');
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ admin_notes: notes })
        .eq('id', client.id);

      if (error) throw error;
      alert('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes');
    } finally {
      setSaving(false);
    }
  };

  // Obtener el siguiente y anterior estado en el pipeline
  const getNextPrevStatus = () => {
    const currentIndex = pipelineFlow.indexOf(client.status);
    
    return {
      nextStatus: currentIndex < pipelineFlow.length - 1 ? pipelineFlow[currentIndex + 1] : null,
      prevStatus: currentIndex > 0 ? pipelineFlow[currentIndex - 1] : null
    };
  };

  if (!isOpen || !client) return null;

  const currentStatus = statusOptions[client.status] || statusOptions.new_lead;
  const CurrentStatusIcon = currentStatus.icon;
  const { nextStatus, prevStatus } = getNextPrevStatus();

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
      padding: '24px 32px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f9fafb'
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
      backgroundColor: currentStatus.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    clientInfo: {
      flex: 1
    },
    clientName: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    clientId: {
      fontSize: '14px',
      color: '#6b7280',
      fontFamily: 'monospace',
      marginTop: '4px'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '24px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      backgroundColor: currentStatus.color + '20',
      color: currentStatus.color,
      marginTop: '8px'
    },
    closeButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      color: '#6b7280',
      transition: 'all 0.2s'
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      height: 'calc(90vh - 140px)',
      overflow: 'hidden'
    },
    leftPanel: {
      padding: '32px',
      overflow: 'auto'
    },
    rightPanel: {
      borderLeft: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      padding: '32px',
      overflow: 'auto'
    },
    section: {
      marginBottom: '32px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px'
    },
    infoItem: {
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    infoLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px'
    },
    infoValue: {
      fontSize: '14px',
      color: '#1f2937',
      fontWeight: '500'
    },
    documentsGrid: {
      display: 'grid',
      gap: '12px'
    },
    documentItem: {
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.2s'
    },
    documentInfo: {
      flex: 1
    },
    documentName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1f2937',
      marginBottom: '4px'
    },
    documentMeta: {
      fontSize: '12px',
      color: '#6b7280'
    },
    documentActions: {
      display: 'flex',
      gap: '8px'
    },
    iconButton: {
      padding: '6px',
      backgroundColor: 'transparent',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#6b7280',
      transition: 'all 0.2s'
    },
    notesTextarea: {
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '12px',
      marginTop: '24px'
    },
    actionButton: {
      padding: '12px 16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    primaryButton: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white'
    },
    warningButton: {
      backgroundColor: '#f59e0b',
      color: 'white'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>
              {client.first_name?.[0]}{client.last_name?.[0]}
            </div>
            <div style={styles.clientInfo}>
              <h2 style={styles.clientName}>
                {client.first_name} {client.last_name}
              </h2>
              <p style={styles.clientId}>ID: {client.custom_id}</p>
              <div style={styles.statusBadge}>
                <CurrentStatusIcon style={{ width: '14px', height: '14px' }} />
                {currentStatus.label}
              </div>
            </div>
          </div>
          <button 
            style={styles.closeButton}
            onClick={onClose}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Left Panel - Client Information */}
          <div style={styles.leftPanel}>
            {/* Personal Information */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <User style={{ width: '20px', height: '20px' }} />
                Personal Information
              </h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Email</div>
                  <div style={styles.infoValue}>{client.email}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Phone</div>
                  <div style={styles.infoValue}>{client.phone || 'Not provided'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Date of Birth</div>
                  <div style={styles.infoValue}>
                    {client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>SSN</div>
                  <div style={styles.infoValue}>
                    {client.ssn ? `***-**-${client.ssn.slice(-4)}` : 'Not provided'}
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Address</div>
                  <div style={styles.infoValue}>{client.address || 'Not provided'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>City, State, ZIP</div>
                  <div style={styles.infoValue}>
                    {[client.city, client.state, client.zip_code].filter(Boolean).join(', ') || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>

            {/* Experian Information */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Shield style={{ width: '20px', height: '20px' }} />
                Experian Account
              </h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Username</div>
                  <div style={styles.infoValue}>{client.experian_username || 'Not provided'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Security Answer</div>
                  <div style={styles.infoValue}>{client.security_answer || 'Not provided'}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>4-Digit PIN</div>
                  <div style={styles.infoValue}>{client.four_digit_pin || 'Not provided'}</div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Building2 style={{ width: '20px', height: '20px' }} />
                Account Details
              </h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Created</div>
                  <div style={styles.infoValue}>
                    {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Last Activity</div>
                  <div style={styles.infoValue}>
                    {client.last_activity 
                      ? new Date(client.last_activity).toLocaleDateString() 
                      : 'No activity'}
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Assigned Broker</div>
                  <div style={styles.infoValue}>
                    {client.brokers 
                      ? `${client.brokers.first_name} ${client.brokers.last_name}` 
                      : 'Unassigned'}
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Created By</div>
                  <div style={styles.infoValue}>{client.created_by || 'System'}</div>
                </div>
              </div>
            </div>

           {/* Documents */}
<div style={styles.section}>
  <h3 style={styles.sectionTitle}>
    <FileText style={{ width: '20px', height: '20px' }} />
    Documents ({documents.length})
  </h3>
  <div style={styles.documentsGrid}>
    {documents.length > 0 ? (
      documents.map((doc, index) => (
        <div key={index} style={styles.documentItem}>
          <div style={styles.documentInfo}>
            <div style={styles.documentName}>{doc.name}</div>
            <div style={styles.documentMeta}>
              {Math.round(doc.metadata?.size / 1024) || 0} KB • 
              {new Date(doc.created_at).toLocaleDateString()}
            </div>
          </div>
          <div style={styles.documentActions}>
            <button
              style={styles.iconButton}
              onClick={() => viewDocument(doc.name)}
              title="View document"
            >
              <Eye style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              style={styles.iconButton}
              onClick={() => downloadDocument(doc.name)}
              title="Download document"
            >
              <Download style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      ))
    ) : (
      <div style={{ 
        textAlign: 'center', 
        padding: '32px', 
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <FileText style={{ width: '32px', height: '32px', margin: '0 auto 8px' }} />
        <p>No documents uploaded yet</p>
      </div>
    )}
  </div>
</div>

{/* Upload Documents Section - Solo para brokers */}
{currentUser.role === 'broker' && (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      <Upload style={{ width: '20px', height: '20px' }} />
      Upload Missing Documents
    </h3>
    
    {/* Indicador de documentos faltantes */}
    <div style={{
      padding: '12px',
      backgroundColor: '#fef3c7',
      border: '1px solid #fbbf24',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#92400e',
      marginBottom: '16px'
    }}>
      <strong>Required:</strong> All 5 documents must be uploaded before client can advance in pipeline
    </div>

    {/* File inputs */}
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* ID Document */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
          ID Document {client.id_document_url && <span style={{ color: '#10b981' }}>✓ Uploaded</span>}
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleBrokerFileUpload(e.target.files[0], 'id_document')}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      {/* SSN Card */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
          SSN Card {client.ssn_card_url && <span style={{ color: '#10b981' }}>✓ Uploaded</span>}
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleBrokerFileUpload(e.target.files[0], 'ssn_card')}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      {/* Experian Report */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
          Experian Report {client.experian_report_url && <span style={{ color: '#10b981' }}>✓ Uploaded</span>}
        </label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => handleBrokerFileUpload(e.target.files[0], 'experian_report')}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      {/* Equifax Report */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
          Equifax Report {client.equifax_report_url && <span style={{ color: '#10b981' }}>✓ Uploaded</span>}
        </label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => handleBrokerFileUpload(e.target.files[0], 'equifax_report')}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>

      {/* TransUnion Report */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
          TransUnion Report {client.transunion_report_url && <span style={{ color: '#10b981' }}>✓ Uploaded</span>}
        </label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => handleBrokerFileUpload(e.target.files[0], 'transunion_report')}
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>
    </div>
  </div>
)}

          {/* Right Panel - Actions & Notes */}
          <div style={styles.rightPanel}>
            {/* Admin Notes */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Edit style={{ width: '20px', height: '20px' }} />
                Admin Notes
              </h3>
              <textarea
                style={styles.notesTextarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this client..."
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                onClick={saveNotes}
                disabled={saving}
                style={{
                  ...styles.actionButton,
                  ...styles.secondaryButton,
                  marginTop: '12px'
                }}
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Status Actions */}
            {currentUser.role === 'admin' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <CheckCircle style={{ width: '20px', height: '20px' }} />
                  Pipeline Actions
                </h3>
                <div style={styles.actionsGrid}>
                  {/* Botón para retroceder */}
                  {prevStatus && (
                    <button
                      onClick={() => updateClientStatus(prevStatus)}
                      disabled={loading}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: '#f59e0b',
                        color: 'white'
                      }}
                    >
                      <ArrowLeft style={{ width: '14px', height: '14px' }} />
                      Back to {statusOptions[prevStatus]?.label}
                    </button>
                  )}

                  {/* Botón para avanzar */}
                  {nextStatus && (
                    <button
                      onClick={() => updateClientStatus(nextStatus)}
                      disabled={loading}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: '#10b981',
                        color: 'white'
                      }}
                    >
                      <ArrowRight style={{ width: '14px', height: '14px' }} />
                      Move to {statusOptions[nextStatus]?.label}
                    </button>
                  )}

                  {/* Botón reject (desde cualquier estado) */}
                  {client.status !== 'rejected' && (
                    <button
                      onClick={() => updateClientStatus('rejected')}
                      disabled={loading}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: '#ef4444',
                        color: 'white'
                      }}
                    >
                      <XCircle style={{ width: '14px', height: '14px' }} />
                      Reject Client
                    </button>
                  )}

                  {/* Si está rejected, permitir regresar a cualquier estado */}
                  {client.status === 'rejected' && (
                    <>
                      <button
                        onClick={() => updateClientStatus('new_lead')}
                        disabled={loading}
                        style={{
                          ...styles.actionButton,
                          backgroundColor: '#6b7280',
                          color: 'white'
                        }}
                      >
                        <Users style={{ width: '14px', height: '14px' }} />
                        Restore to New Leads
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <AlertTriangle style={{ width: '20px', height: '20px' }} />
                Quick Review
              </h3>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                <p><strong>Application Status:</strong> {currentStatus.label}</p>
                <p><strong>Documents:</strong> {documents.length} files uploaded</p>
                <p><strong>Last Update:</strong> {client.last_activity 
                  ? new Date(client.last_activity).toLocaleDateString() 
                  : 'No recent activity'}</p>
                <p><strong>Account Age:</strong> {Math.floor(
                  (new Date() - new Date(client.created_at)) / (1000 * 60 * 60 * 24)
                )} days</p>
                <p><strong>Pipeline Stage:</strong> {pipelineFlow.indexOf(client.status) + 1} of {pipelineFlow.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
