import React, { useState } from 'react';
import { X, Upload, Building2, Mail, Phone, User, FileText, CreditCard, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

const NewAffiliateModal = ({ isOpen, onClose, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [showContractPopup, setShowContractPopup] = useState(false);
  const [showW9Popup, setShowW9Popup] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [w9Completed, setW9Completed] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [w9Data, setW9Data] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    payment_method: '',
    payment_info: {
      account_name: '',
      account_email: '',
      account_number: '',
      additional_info: ''
    },
    notes: '',
    files: {
      id_document: null,
      w9_document: null
    }
  });

  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { value: 'zelle', label: 'Zelle', fields: ['account_email', 'account_name'] },
    { value: 'wire', label: 'Wire Transfer', fields: ['account_name', 'account_number', 'additional_info'] },
    { value: 'paypal', label: 'PayPal', fields: ['account_email', 'account_name'] }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.first_name.trim()) newErrors.first_name = 'Card holder first name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Card holder last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.payment_method) newErrors.payment_method = 'Preferred payment method is required';
    
    // Validar que el contrato esté firmado
    if (!contractSigned) newErrors.contract = 'Card Holder Agreement signature is required';

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

    // Validación de campos de pago según método seleccionado
    if (formData.payment_method) {
      const method = paymentMethods.find(m => m.value === formData.payment_method);
      if (method) {
        method.fields.forEach(field => {
          if (!formData.payment_info[field]?.trim()) {
            newErrors[`payment_${field}`] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required for ${method.label}`;
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const affiliateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.toLowerCase().trim(),
        payment_method: formData.payment_method,
        payment_info: JSON.stringify(formData.payment_info),
        status: 'active',
        active: true,
        created_by: currentUser?.email || 'system',
        registration_type: 'admin_created'
      };

      // Solo agregar notes si el usuario es admin
      if (currentUser?.role === 'admin' && formData.notes.trim()) {
        affiliateData.notes = formData.notes.trim();
      }

      if (signatureData) {
        affiliateData.signature_url = 'signature_placeholder';
        affiliateData.contract_signed_date = new Date().toISOString();
      }

      if (w9Data) {
        affiliateData.w9_completed = true;
        affiliateData.w9_completion_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('affiliates')
        .insert([affiliateData])
        .select();

      if (error) throw error;

      alert('Affiliate created successfully!');
      handleClose();
    } catch (error) {
      console.error('Error creating affiliate:', error);
      alert('Error creating affiliate: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      payment_method: '',
      payment_info: {
        account_name: '',
        account_email: '',
        account_number: '',
        additional_info: ''
      },
      notes: '',
      files: {
        id_document: null,
        w9_document: null
      }
    });
    setErrors({});
    setContractSigned(false);
    setW9Completed(false);
    setSignatureData(null);
    setW9Data(null);
    setShowContractPopup(false);
    setShowW9Popup(false);
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

  const handleContractSign = (signatureResult) => {
    setSignatureData(signatureResult);
    setContractSigned(true);
    setShowContractPopup(false);
  };

  const handleW9Complete = (w9Result) => {
    setW9Data(w9Result);
    setW9Completed(true);
    setShowW9Popup(false);
  };

  const getPaymentFields = () => {
    if (!formData.payment_method) return null;
    
    const method = paymentMethods.find(m => m.value === formData.payment_method);
    if (!method) return null;

    return method.fields.map(field => {
      let label = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      let placeholder = '';
      
      switch (field) {
        case 'account_email':
          placeholder = formData.payment_method === 'zelle' ? 'Zelle email address' : 'PayPal email address';
          break;
        case 'account_name':
          placeholder = 'Account holder name';
          break;
        case 'account_number':
          placeholder = 'Account/routing number';
          break;
        case 'additional_info':
          placeholder = 'Bank name, routing number, etc.';
          label = 'Additional Banking Info';
          break;
      }

      return (
        <div key={field} style={styles.fieldGroup}>
          <label style={styles.label}>
            <DollarSign size={16} />
            {label} <span style={styles.required}>*</span>
          </label>
          {field === 'additional_info' ? (
            <textarea
              value={formData.payment_info[field]}
              onChange={(e) => setFormData({
                ...formData,
                payment_info: {
                  ...formData.payment_info,
                  [field]: e.target.value
                }
              })}
              style={{
                ...styles.textarea,
                ...(errors[`payment_${field}`] ? styles.inputError : {})
              }}
              placeholder={placeholder}
            />
          ) : (
            <input
              type={field === 'account_email' ? 'email' : 'text'}
              value={formData.payment_info[field]}
              onChange={(e) => setFormData({
                ...formData,
                payment_info: {
                  ...formData.payment_info,
                  [field]: e.target.value
                }
              })}
              style={{
                ...styles.input,
                ...(errors[`payment_${field}`] ? styles.inputError : {})
              }}
              placeholder={placeholder}
            />
          )}
          {errors[`payment_${field}`] && <span style={styles.errorText}>{errors[`payment_${field}`]}</span>}
        </div>
      );
    });
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
    select: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
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
      backgroundColor: '#7c3aed',
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
            <Building2 style={{ width: '24px', height: '24px', color: '#7c3aed' }} />
            <div>
              <h2 style={styles.title}>New Affiliate</h2>
              <p style={styles.subtitle}>Add a new card holder to the system</p>
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
            {/* Card Holder Information */}
            <div>
              <h3 style={styles.sectionTitle}>Card Holder Information</h3>
              
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <User size={16} />
                    Card Holder First Name <span style={styles.required}>*</span>
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
                    Card Holder Last Name <span style={styles.required}>*</span>
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
                    placeholder="cardholder@example.com"
                  />
                  {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 style={styles.sectionTitle}>Payment Information</h3>
              
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <CreditCard size={16} />
                    Preferred Form of Payment <span style={styles.required}>*</span>
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => {
                      setFormData({
                        ...formData, 
                        payment_method: e.target.value,
                        payment_info: {
                          account_name: '',
                          account_email: '',
                          account_number: '',
                          additional_info: ''
                        }
                      });
                    }}
                    style={{
                      ...styles.select,
                      ...(errors.payment_method ? styles.inputError : {})
                    }}
                  >
                    <option value="">Select payment method</option>
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                  {errors.payment_method && <span style={styles.errorText}>{errors.payment_method}</span>}
                </div>
              </div>

              {/* Dynamic Payment Fields */}
              {formData.payment_method && (
                <div style={styles.row}>
                  {getPaymentFields()}
                </div>
              )}
            </div>

            {/* Required Documents */}
            <div>
              <h3 style={styles.sectionTitle}>Required Documents</h3>
              
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Upload size={16} />
                    ID or Driver License
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
                      <p>Click to upload ID or Driver License</p>
                      <p style={{fontSize: '12px', color: '#6b7280'}}>PNG, JPG, PDF up to 10MB</p>
                    </label>
                    {formData.files.id_document && (
                      <p style={styles.fileName}>{formData.files.id_document.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contract and Tax Forms */}
            <div>
              <h3 style={styles.sectionTitle}>Legal Documents</h3>
              
              {/* Card Holder Agreement */}
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <FileText size={16} />
                    Card Holder Agreement <span style={styles.required}>*</span>
                  </label>
                  
                  {!contractSigned ? (
                    <div style={{
                      ...styles.fileUpload,
                      backgroundColor: '#fef3c7',
                      borderColor: '#fbbf24'
                    }}>
                      <FileText style={{ width: '24px', height: '24px', color: '#d97706', margin: '0 auto 8px' }} />
                      <p style={{color: '#92400e', fontWeight: '500'}}>Agreement signature required</p>
                      <p style={{fontSize: '12px', color: '#92400e', marginBottom: '12px'}}>
                        Click below to review and sign the card holder agreement
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
                        Review & Sign Agreement
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
                        <FileText size={20} />
                        Agreement signed successfully
                      </div>
                      <p style={{fontSize: '12px', color: '#059669', marginTop: '4px'}}>
                        Signed on {signatureData?.contractData?.signature_date}
                      </p>
                    </div>
                  )}
                  {errors.contract && <span style={styles.errorText}>{errors.contract}</span>}
                </div>
              </div>

              {/* W-9 Form */}
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <FileText size={16} />
                    W-9 Tax Form (Optional)
                  </label>
                  
                  <div style={styles.row}>
                    <div style={styles.fieldGroup}>
                      <button
                        type="button"
                        onClick={() => setShowW9Popup(true)}
                        style={{
                          ...styles.fileUpload,
                          backgroundColor: w9Completed ? '#ecfdf5' : '#f8fafc',
                          borderColor: w9Completed ? '#10b981' : '#d1d5db',
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FileText style={{ 
                          width: '24px', 
                          height: '24px', 
                          color: w9Completed ? '#059669' : '#6b7280', 
                          margin: '0 auto 8px' 
                        }} />
                        <p style={{
                          color: w9Completed ? '#059669' : '#374151',
                          fontWeight: w9Completed ? '600' : '400'
                        }}>
                          {w9Completed ? 'W-9 Form Completed' : 'Fill W-9 Form Online'}
                        </p>
                        <p style={{fontSize: '12px', color: '#6b7280'}}>
                          Click to {w9Completed ? 'view/edit' : 'complete'} W-9 form
                        </p>
                      </button>
                    </div>

                    <div style={styles.fieldGroup}>
                      <div style={styles.fileUpload}>
                        <input
                          type="file"
                          id="w9_document"
                          accept=".pdf"
                          onChange={(e) => handleFileChange('w9_document', e.target.files[0])}
                          style={styles.fileInput}
                        />
                        <label htmlFor="w9_document" style={{cursor: 'pointer'}}>
                          <Upload style={{ width: '24px', height: '24px', color: '#6b7280', margin: '0 auto 8px' }} />
                          <p>Upload Your Own W-9</p>
                          <p style={{fontSize: '12px', color: '#6b7280'}}>PDF up to 10MB</p>
                        </label>
                        {formData.files.w9_document && (
                          <p style={styles.fileName}>{formData.files.w9_document.name}</p>
                        )}
                      </div>
                    </div>
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
                    placeholder="Internal notes about this affiliate..."
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
            {loading ? 'Creating Affiliate...' : 'Create Affiliate'}
          </button>
        </div>
      </div>

      {/* Contract and W-9 Popups will be added here */}
    </div>
  );
};

export default NewAffiliateModal;
