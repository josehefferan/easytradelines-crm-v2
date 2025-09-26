import React, { useState } from 'react';
import { X, Upload, User, Mail, Phone, MapPin, Calendar, Shield, Eye, EyeOff, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

const NewClientModal = ({ isOpen, onClose, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    experian_password: false,
    experian_pin: false
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    phone: '',
    email: '',
    ssn: '',
    date_of_birth: '',
    experian_user: '',
    experian_password: '',
    experian_security_answer: '',
    experian_pin: '',
    notes: '',
    files: {
      id_document: null,
      ssn_card: null,
      experian_report: null,
      equifax_report: null,
      transunion_report: null
    }
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.ssn.trim()) newErrors.ssn = 'Social Security Number is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validación de teléfono
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validación de SSN (formato XXX-XX-XXXX)
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    if (formData.ssn && !ssnRegex.test(formData.ssn.replace(/\s/g, ''))) {
      newErrors.ssn = 'Please enter a valid SSN (XXX-XX-XXXX)';
    }

    // Validación de dirección (no PO Box)
    if (formData.address && /p\.?o\.?\s*box/i.test(formData.address)) {
      newErrors.address = 'PO Box addresses are not allowed. Please use residential address only.';
    }

    // Validación de PIN (4 dígitos)
    if (formData.experian_pin && !/^\d{4}$/.test(formData.experian_pin)) {
      newErrors.experian_pin = 'PIN must be exactly 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setLoading(true);
  try {
    // Generar unique_id con formato C-YYYYMMDD-XXXX
    // Generar unique_id con formato C-YYYYMMDD-XXXX
const generateClientNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  const prefix = `C-${dateStr}`;
  console.log('Buscando clientes con prefijo:', prefix);
  
  const { data: todaysClients, error } = await supabase
    .from('clients')
    .select('unique_id')
    .like('unique_id', `${prefix}%`)
    .order('unique_id', { ascending: false });

  console.log('Clientes encontrados:', todaysClients);
  console.log('Error si hay:', error);
  
  let nextNumber = 1;
  if (todaysClients && todaysClients.length > 0) {
    let maxNumber = 0;
    todaysClients.forEach(client => {
      if (client.unique_id) {
        const parts = client.unique_id.split('-');
        const num = parseInt(parts[parts.length - 1]) || 0;
        console.log('Procesando:', client.unique_id, 'Número extraído:', num);
        if (num > maxNumber) maxNumber = num;
      }
    });
    nextNumber = maxNumber + 1;
  }

  const newId = `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  console.log('ID final generado:', newId);
  return newId;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setLoading(true);
  try {
    // AHORA SOLO LA LLAMAS
    const clientNumber = await generateClientNumber();
    
    // Formatear SSN
    const formattedSSN = formData.ssn.replace(/\D/g, '').replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');

    const clientData = {
      unique_id: clientNumber,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.toLowerCase().trim(),
      ssn: formattedSSN,
      date_of_birth: formData.date_of_birth,
      experian_user: formData.experian_user.trim(),
      experian_password: formData.experian_password,
      experian_security_answer: formData.experian_security_answer.trim(),
      experian_pin: formData.experian_pin,
      status: 'new_lead',
      created_by: currentUser?.email || 'system',
      created_by_type: currentUser?.role === 'admin' ? 'admin' : 'broker'
    };

    // Si el usuario es un broker, asignar automáticamente el client a este broker
    if (currentUser?.role === 'broker') {
      // Primero obtener el broker_id desde la tabla brokers
      const { data: brokerData, error: brokerError } = await supabase
        .from('brokers')
        .select('id')
        .eq('email', currentUser.email)
        .single();

      if (brokerError) {
        console.error('Error finding broker:', brokerError);
      } else if (brokerData) {
        clientData.assigned_broker_id = brokerData.id;
      }
    }

    // Solo agregar notes si el usuario es admin
    if (currentUser?.role === 'admin' && formData.notes.trim()) {
      clientData.notes = formData.notes.trim();
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select();

    if (error) throw error;

    alert(`Client ${clientNumber} created successfully!`);
    handleClose();
    
    // Recargar la página para actualizar las listas
    window.location.reload();
    
  } catch (error) {
    console.error('Error creating client:', error);
    alert('Error creating client: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      address: '',
      phone: '',
      email: '',
      ssn: '',
      date_of_birth: '',
      experian_user: '',
      experian_password: '',
      experian_security_answer: '',
      experian_pin: '',
      notes: '',
      files: {
        id_document: null,
        ssn_card: null,
        experian_report: null,
        equifax_report: null,
        transunion_report: null
      }
    });
    setErrors({});
    onClose();
  };

  const handleFileChange = (fileType, file) => {
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [fileType]: file
      }
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    closeButton: {
      padding: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      borderRadius: '6px',
      color: '#6b7280',
      transition: 'all 0.2s'
    },
    submitButtonHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: '#16a34a',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    submitButtonHeaderDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    content: {
      padding: '24px',
      maxHeight: 'calc(90vh - 140px)',
      overflowY: 'auto'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    threeColumns: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px'
    },
    fullRow: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    required: {
      color: '#ef4444'
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'border-color 0.2s',
      outline: 'none'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    textarea: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      outline: 'none'
    },
    passwordContainer: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '4px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e5e7eb'
    },
    fileUpload: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.2s'
    },
    fileUploadSmall: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.2s'
    },
    fileInput: {
      display: 'none'
    },
    fileName: {
      fontSize: '12px',
      color: '#374151',
      marginTop: '8px',
      wordBreak: 'break-word'
    },
    errorText: {
      fontSize: '12px',
      color: '#ef4444',
      marginTop: '4px'
    },
    adminOnly: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fbbf24',
      borderRadius: '6px',
      padding: '12px',
      fontSize: '12px',
      color: '#92400e',
      marginBottom: '8px'
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none'
    },
    cancelButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    submitButton: {
      backgroundColor: '#16a34a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    submitButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    creditBureauLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#374151',
      textAlign: 'center',
      marginBottom: '8px'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <User style={{ width: '24px', height: '24px', color: '#16a34a' }} />
            <div>
              <h2 style={styles.title}>New Client Application</h2>
              <p style={styles.subtitle}>Add a new client to the system</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.submitButtonHeader,
                ...(loading ? styles.submitButtonHeaderDisabled : {})
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#15803d')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#16a34a')}
            >
              <Send size={16} />
              {loading ? 'SUBMITTING...' : 'SUBMIT CLIENT APPLICATION'}
            </button>
            <button
              onClick={handleClose}
              style={styles.closeButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Personal Information */}
            <div>
              <h3 style={styles.sectionTitle}>Personal Information</h3>
              
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <User size={16} />
                    First Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.first_name ? styles.inputError : {})
                    }}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && <span style={styles.errorText}>{errors.first_name}</span>}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <User size={16} />
                    Last Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.last_name ? styles.inputError : {})
                    }}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && <span style={styles.errorText}>{errors.last_name}</span>}
                </div>
              </div>

              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <MapPin size={16} />
                    Address (Residential Only - No PO Box) <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.address ? styles.inputError : {})
                    }}
                    placeholder="Enter residential address"
                  />
                  {errors.address && <span style={styles.errorText}>{errors.address}</span>}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Phone size={16} />
                    Phone Number <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.phone ? styles.inputError : {})
                    }}
                    placeholder="+1-555-0123"
                  />
                  {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Mail size={16} />
                    Email Address <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.email ? styles.inputError : {})
                    }}
                    placeholder="client@example.com"
                  />
                  {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Shield size={16} />
                    Social Security Number <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ssn}
                    onChange={(e) => setFormData({...formData, ssn: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.ssn ? styles.inputError : {})
                    }}
                    placeholder="XXX-XX-XXXX"
                    maxLength="11"
                  />
                  {errors.ssn && <span style={styles.errorText}>{errors.ssn}</span>}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Calendar size={16} />
                    Date of Birth <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.date_of_birth ? styles.inputError : {})
                    }}
                  />
                  {errors.date_of_birth && <span style={styles.errorText}>{errors.date_of_birth}</span>}
                </div>
              </div>
            </div>

            {/* Experian Login Information */}
            <div>
              <h3 style={styles.sectionTitle}>Experian Login Information</h3>
              
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Experian User ID</label>
                  <input
                    type="text"
                    value={formData.experian_user}
                    onChange={(e) => setFormData({...formData, experian_user: e.target.value})}
                    style={styles.input}
                    placeholder="Experian username"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Experian Password</label>
                  <div style={styles.passwordContainer}>
                    <input
                      type={showPasswords.experian_password ? "text" : "password"}
                      value={formData.experian_password}
                      onChange={(e) => setFormData({...formData, experian_password: e.target.value})}
                      style={styles.input}
                      placeholder="Experian password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('experian_password')}
                      style={styles.passwordToggle}
                    >
                      {showPasswords.experian_password ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Security Answer</label>
                  <input
                    type="text"
                    value={formData.experian_security_answer}
                    onChange={(e) => setFormData({...formData, experian_security_answer: e.target.value})}
                    style={styles.input}
                    placeholder="Security question answer"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>4 Digit PIN</label>
                  <div style={styles.passwordContainer}>
                    <input
                      type={showPasswords.experian_pin ? "text" : "password"}
                      value={formData.experian_pin}
                      onChange={(e) => setFormData({...formData, experian_pin: e.target.value})}
                      style={{
                        ...styles.input,
                        ...(errors.experian_pin ? styles.inputError : {})
                      }}
                      placeholder="1234"
                      maxLength="4"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('experian_pin')}
                      style={styles.passwordToggle}
                    >
                      {showPasswords.experian_pin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.experian_pin && <span style={styles.errorText}>{errors.experian_pin}</span>}
                </div>
              </div>
            </div>

            {/* Admin Only Notes */}
            {currentUser?.role === 'admin' && (
              <div>
                <h3 style={styles.sectionTitle}>Admin Notes</h3>
                <div style={styles.adminOnly}>
                  <strong>Admin Only:</strong> These notes are only visible to administrators.
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    style={styles.textarea}
                    placeholder="Internal notes about this client..."
                  />
                </div>
              </div>
            )}

            {/* File Uploads */}
            <div>
              <h3 style={styles.sectionTitle}>Required Documents</h3>
              
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Upload size={16} />
                    ID Document
                  </label>
                  <div style={styles.fileUpload}>
                    <input
                      type="file"
                      id="id_document"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('id_document', e.target.files[0])}
                      style={styles.fileInput}
                    />
                    <label htmlFor="id_document" style={{cursor: 'pointer'}}>
                      <Upload style={{ width: '24px', height: '24px', color: '#6b7280', margin: '0 auto 8px' }} />
                      <p>Click to upload ID Document</p>
                      <p style={{fontSize: '12px', color: '#6b7280'}}>PNG, JPG, PDF up to 10MB</p>
                    </label>
                    {formData.files.id_document && (
                      <p style={styles.fileName}>{formData.files.id_document.name}</p>
                    )}
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Upload size={16} />
                    Social Security Card
                  </label>
                  <div style={styles.fileUpload}>
                    <input
                      type="file"
                      id="ssn_card"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('ssn_card', e.target.files[0])}
                      style={styles.fileInput}
                    />
                    <label htmlFor="ssn_card" style={{cursor: 'pointer'}}>
                      <Upload style={{ width: '24px', height: '24px', color: '#6b7280', margin: '0 auto 8px' }} />
                      <p>Click to upload SSN Card</p>
                      <p style={{fontSize: '12px', color: '#6b7280'}}>PNG, JPG, PDF up to 10MB</p>
                    </label>
                    {formData.files.ssn_card && (
                      <p style={styles.fileName}>{formData.files.ssn_card.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Bureau Credit Reports - Separated */}
              <div>
                <h4 style={{...styles.sectionTitle, fontSize: '14px', marginBottom: '12px'}}>3 Bureau Credit Reports</h4>
                
                <div style={styles.threeColumns}>
                  {/* Experian Report */}
                  <div style={styles.fieldGroup}>
                    <div style={styles.creditBureauLabel}>1. Experian</div>
                    <div style={styles.fileUploadSmall}>
                      <input
                        type="file"
                        id="experian_report"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('experian_report', e.target.files[0])}
                        style={styles.fileInput}
                      />
                      <label htmlFor="experian_report" style={{cursor: 'pointer'}}>
                        <Upload style={{ width: '20px', height: '20px', color: '#6b7280', margin: '0 auto 6px' }} />
                        <p style={{fontSize: '12px', margin: '4px 0'}}>Upload Experian</p>
                        <p style={{fontSize: '10px', color: '#6b7280'}}>PDF up to 10MB</p>
                      </label>
                      {formData.files.experian_report && (
                        <p style={styles.fileName}>{formData.files.experian_report.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Equifax Report */}
                  <div style={styles.fieldGroup}>
                    <div style={styles.creditBureauLabel}>2. Equifax</div>
                    <div style={styles.fileUploadSmall}>
                      <input
                        type="file"
                        id="equifax_report"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('equifax_report', e.target.files[0])}
                        style={styles.fileInput}
                      />
                      <label htmlFor="equifax_report" style={{cursor: 'pointer'}}>
                        <Upload style={{ width: '20px', height: '20px', color: '#6b7280', margin: '0 auto 6px' }} />
                        <p style={{fontSize: '12px', margin: '4px 0'}}>Upload Equifax</p>
                        <p style={{fontSize: '10px', color: '#6b7280'}}>PDF up to 10MB</p>
                      </label>
                      {formData.files.equifax_report && (
                        <p style={styles.fileName}>{formData.files.equifax_report.name}</p>
                      )}
                    </div>
                  </div>

                  {/* TransUnion Report */}
                  <div style={styles.fieldGroup}>
                    <div style={styles.creditBureauLabel}>3. TransUnion</div>
                    <div style={styles.fileUploadSmall}>
                      <input
                        type="file"
                        id="transunion_report"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('transunion_report', e.target.files[0])}
                        style={styles.fileInput}
                      />
                      <label htmlFor="transunion_report" style={{cursor: 'pointer'}}>
                        <Upload style={{ width: '20px', height: '20px', color: '#6b7280', margin: '0 auto 6px' }} />
                        <p style={{fontSize: '12px', margin: '4px 0'}}>Upload TransUnion</p>
                        <p style={{fontSize: '10px', color: '#6b7280'}}>PDF up to 10MB</p>
                      </label>
                      {formData.files.transunion_report && (
                        <p style={styles.fileName}>{formData.files.transunion_report.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={handleClose}
            style={{...styles.button, ...styles.cancelButton}}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.submitButtonDisabled : styles.submitButton)
            }}
          >
            <Send size={16} />
            {loading ? 'Submitting Application...' : 'Submit Client Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewClientModal;
