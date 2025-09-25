import React, { useState } from 'react';
import { X, Upload, UserCheck, Mail, Phone, Building, Globe, User, FileText, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ContractSignaturePopup from './ContractSignaturePopup';

const NewBrokerModal = ({ isOpen, onClose, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [showContractPopup, setShowContractPopup] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    company_website: '',
    phone: '',
    alt_contact_name: '',
    alt_contact_phone: '',
    cc_poc_email: '',
    notes: '',
    files: {
      driver_license: null
    }
  });

  const [errors, setErrors] = useState({});

  // Manejar firma del contrato
  const handleContractSign = (signatureResult) => {
    setSignatureData(signatureResult);
    setContractSigned(true);
    setShowContractPopup(false);
  };

  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Validar que el contrato esté firmado
    if (!contractSigned) newErrors.contract = 'Contract signature is required';

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validación de CC POC email si se proporciona
    if (formData.cc_poc_email && !emailRegex.test(formData.cc_poc_email)) {
      newErrors.cc_poc_email = 'Please enter a valid CC POC email address';
    }

    // Validación de teléfono
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validación de teléfono alternativo si se proporciona
    if (formData.alt_contact_phone && !phoneRegex.test(formData.alt_contact_phone)) {
      newErrors.alt_contact_phone = 'Please enter a valid alternate phone number';
    }

    // Validación de URL del sitio web si se proporciona
    if (formData.company_website && !/^https?:\/\/.+\..+/.test(formData.company_website)) {
      newErrors.company_website = 'Please enter a valid website URL (e.g., https://example.com)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const brokerData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.toLowerCase().trim(),
        company_name: formData.company_name.trim(),
        company_website: formData.company_website.trim(),
        phone: formData.phone.trim(),
        alt_contact_name: formData.alt_contact_name.trim(),
        alt_contact_phone: formData.alt_contact_phone.trim(),
        cc_poc_email: formData.cc_poc_email.toLowerCase().trim(),
        status: 'pending',
        active: true,
        created_by: currentUser?.email || 'system',
        registration_type: 'admin_created'
      };

      // Solo agregar notes si el usuario es admin
      if (currentUser?.role === 'admin' && formData.notes.trim()) {
        brokerData.notes = formData.notes.trim();
      }

      const { data, error } = await supabase
        .from('brokers')
        .insert([brokerData])
        .select();

      if (error) throw error;

      // TODO: Implementar subida de archivos aquí
      // TODO: Guardar firma digital en Supabase Storage

      if (signatureData) {
        // Aquí guardarías la firma en Supabase Storage
        brokerData.signature_url = 'signature_placeholder';
        brokerData.contract_signed_date = new Date().toISOString();
      }

      alert('Broker created successfully!');
      handleClose();
    } catch (error) {
      console.error('Error creating broker:', error);
      alert('Error creating broker: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      company_name: '',
      company_website: '',
      phone: '',
      alt_contact_name: '',
      alt_contact_phone: '',
      cc_poc_email: '',
      notes: '',
      files: {
        driver_license: null
      }
    });
    setErrors({});
    setContractSigned(false);
    setSignatureData(null);
    setShowContractPopup(false);
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
      maxWidth: '700px',
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
    optional: {
      color: '#9ca3af',
      fontSize: '12px',
      fontWeight: '400'
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
    fileInput: {
      display: 'none'
    },
    fileName: {
      fontSize: '14px',
      color: '#374151',
      marginTop: '8px'
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
      backgroundColor: '#2563eb',
      color: 'white'
    },
    submitButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <UserCheck style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            <div>
              <h2 style={styles.title}>New Broker</h2>
              <p style={styles.subtitle}>Add a new broker to the system</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={styles.closeButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={styles.content}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Personal Information */}
            <div>
              <h3 style={styles.sectionTitle}>Broker Information</h3>
              
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
                    placeholder="broker@example.com"
                  />
                  {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 style={styles.sectionTitle}>Company Information</h3>
              
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Building size={16} />
                    Company Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.company_name ? styles.inputError : {})
                    }}
                    placeholder="Enter company name"
                  />
                  {errors.company_name && <span style={styles.errorText}>{errors.company_name}</span>}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Globe size={16} />
                    Company Website/URL <span style={styles.optional}>(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.company_website}
                    onChange={(e) => setFormData({...formData, company_website: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.company_website ? styles.inputError : {})
                    }}
                    placeholder="https://company.com"
                  />
                  {errors.company_website && <span style={styles.errorText}>{errors.company_website}</span>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 style={styles.sectionTitle}>Contact Information</h3>
              
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Phone size={16} />
                    Broker Direct Phone Number <span style={styles.required}>*</span>
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
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <User size={16} />
                    Alternate Contact Name <span style={styles.optional}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.alt_contact_name}
                    onChange={(e) => setFormData({...formData, alt_contact_name: e.target.value})}
                    style={styles.input}
                    placeholder="Assistant or other POC name"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Phone size={16} />
                    Alt POC Phone Number <span style={styles.optional}>(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.alt_contact_phone}
                    onChange={(e) => setFormData({...formData, alt_contact_phone: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.alt_contact_phone ? styles.inputError : {})
                    }}
                    placeholder="+1-555-0124"
                  />
                  {errors.alt_contact_phone && <span style={styles.errorText}>{errors.alt_contact_phone}</span>}
                </div>
              </div>

              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Mail size={16} />
                    CC POC Email <span style={styles.optional}>(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.cc_poc_email}
                    onChange={(e) => setFormData({...formData, cc_poc_email: e.target.value})}
                    style={{
                      ...styles.input,
                      ...(errors.cc_poc_email ? styles.inputError : {})
                    }}
                    placeholder="cc@company.com"
                  />
                  {errors.cc_poc_email && <span style={styles.errorText}>{errors.cc_poc_email}</span>}
                </div>
              </div>
            </div>

            {/* Contract Signature */}
            <div>
              <h3 style={styles.sectionTitle}>Contract Signature</h3>
              
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <FileText size={16} />
                    Reseller Agreement <span style={styles.required}>*</span>
                  </label>
                  
                  {!contractSigned ? (
                    <div style={{
                      ...styles.fileUpload,
                      backgroundColor: '#fef3c7',
                      borderColor: '#fbbf24'
                    }}>
                      <FileText style={{ width: '24px', height: '24px', color: '#d97706', margin: '0 auto 8px' }} />
                      <p style={{color: '#92400e', fontWeight: '500'}}>Contract signature required</p>
                      <p style={{fontSize: '12px', color: '#92400e', marginBottom: '12px'}}>
                        Click below to review and sign the reseller agreement
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowContractPopup(true)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={16} style={{marginRight: '4px', display: 'inline'}} />
                        Review & Sign Contract
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      ...styles.fileUpload,
                      backgroundColor: '#ecfdf5',
                      borderColor: '#10b981'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: '#059669',
                        fontWeight: '600'
                      }}>
                        <Check size={20} />
                        Contract signed successfully
                      </div>
                      <p style={{fontSize: '12px', color: '#059669', marginTop: '4px'}}>
                        Signed on {signatureData?.contractData?.signature_date}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowContractPopup(true)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          marginTop: '8px'
                        }}
                      >
                        View/Edit Contract
                      </button>
                    </div>
                  )}
                  {errors.contract && <span style={styles.errorText}>{errors.contract}</span>}
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h3 style={styles.sectionTitle}>Required Documents</h3>
              
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Upload size={16} />
                    Driver License or ID
                  </label>
                  <div style={styles.fileUpload}>
                    <input
                      type="file"
                      id="driver_license"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('driver_license', e.target.files[0])}
                      style={styles.fileInput}
                    />
                    <label htmlFor="driver_license" style={{cursor: 'pointer'}}>
                      <Upload style={{ width: '24px', height: '24px', color: '#6b7280', margin: '0 auto 8px' }} />
                      <p>Click to upload Driver License</p>
                      <p style={{fontSize: '12px', color: '#6b7280'}}>PNG, JPG, PDF up to 10MB</p>
                    </label>
                    {formData.files.driver_license && (
                      <p style={styles.fileName}>{formData.files.driver_license.name}</p>
                    )}
                  </div>
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
                    placeholder="Internal notes about this broker..."
                  />
                </div>
              </div>
            )}
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
            {loading ? 'Creating Broker...' : 'Create Broker'}
          </button>
        </div>
      </div>

      {/* Contract Signature Popup */}
      <ContractSignaturePopup
        isOpen={showContractPopup}
        onClose={() => setShowContractPopup(false)}
        brokerData={formData}
        onSignComplete={handleContractSign}
        currentUser={currentUser}
      />
    </div>
  );
};

export default NewBrokerModal;
