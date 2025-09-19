import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, DollarSign, Users, Building2, Upload, FileText, Loader2 } from 'lucide-react';
import { clientService, profileService } from '../services/supabaseServices';

const NewClientModal = ({ isOpen, onClose, currentUser, onClientCreated }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    brokerId: '',
    affiliateId: '',
    estimatedAmount: '',
    notes: '',
    status: 'new_lead'
  });

  const [brokers, setBrokers] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadBrokersAndAffiliates();
    }
  }, [isOpen]);

  const loadBrokersAndAffiliates = async () => {
    setLoadingData(true);
    try {
      const [brokersResult, affiliatesResult] = await Promise.all([
        profileService.getBrokers(),
        profileService.getAffiliates()
      ]);

      if (brokersResult.data) setBrokers(brokersResult.data);
      if (affiliatesResult.data) setAffiliates(affiliatesResult.data);
    } catch (err) {
      setError('Failed to load brokers and affiliates');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} is not a supported format. Please use JPG, PNG, PDF, or DOC files.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Please enter a valid email';
    if (!formData.phone.trim()) return 'Phone is required';
    if (formData.estimatedAmount && isNaN(parseFloat(formData.estimatedAmount))) {
      return 'Estimated amount must be a valid number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        brokerId: formData.brokerId || null,
        affiliateId: formData.affiliateId || null,
        estimatedAmount: formData.estimatedAmount ? parseFloat(formData.estimatedAmount) : 0,
        notes: formData.notes.trim(),
        status: formData.status
      };

      const { data, error: createError } = await clientService.create(clientData);

      if (createError) {
        throw new Error(createError);
      }

      // TODO: Upload files to Supabase Storage and link to client
      // This would require additional storage setup

      setSuccess('Client created successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        brokerId: '',
        affiliateId: '',
        estimatedAmount: '',
        notes: '',
        status: 'new_lead'
      });
      setUploadedFiles([]);

      if (onClientCreated) {
        onClientCreated(data);
      }

      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        brokerId: '',
        affiliateId: '',
        estimatedAmount: '',
        notes: '',
        status: 'new_lead'
      });
      setUploadedFiles([]);
      setError('');
      setSuccess('');
      onClose();
    }
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
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 24px 0 24px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '16px'
    },
    headerTitle: {
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
      margin: '4px 0 0 0'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280',
      transition: 'all 0.2s'
    },
    content: {
      padding: '24px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    formGroup: {
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
      gap: '8px'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none'
    },
    select: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
      backgroundColor: 'white'
    },
    textarea: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    fileUpload: {
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
    fileList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginTop: '12px'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px'
    },
    button: {
      flex: 1,
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    cancelButton: {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db'
    },
    submitButton: {
      backgroundColor: '#16a34a',
      color: 'white',
      border: 'none'
    },
    submitButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    alertError: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      border: '1px solid #fecaca'
    },
    alertSuccess: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      border: '1px solid #bbf7d0'
    },
    spinner: {
      width: '16px',
      height: '16px',
      animation: 'spin 1s linear infinite'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#f3f4f6',
      color: '#374151'
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <div style={styles.headerTitle}>
              <User style={{ width: '24px', height: '24px', color: '#16a34a' }} />
              <div>
                <h2 style={styles.title}>New Client</h2>
                <p style={styles.subtitle}>Add a new client to the system</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={styles.closeButton}
              disabled={loading}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <div style={styles.content}>
            {error && <div style={styles.alertError}>{error}</div>}
            {success && <div style={styles.alertSuccess}>{success}</div>}

            {loadingData ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Loader2 style={styles.spinner} />
                <p>Loading brokers and affiliates...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <User style={{ width: '16px', height: '16px' }} />
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter first name"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <User style={{ width: '16px', height: '16px' }} />
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter last name"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Mail style={{ width: '16px', height: '16px' }} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="client@example.com"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Phone style={{ width: '16px', height: '16px' }} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="+1-555-0123"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Users style={{ width: '16px', height: '16px' }} />
                      Assigned Broker
                    </label>
                    <select
                      name="brokerId"
                      value={formData.brokerId}
                      onChange={handleInputChange}
                      style={styles.select}
                      disabled={loading}
                    >
                      <option value="">Select a broker (optional)</option>
                      {brokers.map(broker => (
                        <option key={broker.id} value={broker.id}>
                          {broker.first_name} {broker.last_name} ({broker.unique_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Building2 style={{ width: '16px', height: '16px' }} />
                      Source Affiliate
                    </label>
                    <select
                      name="affiliateId"
                      value={formData.affiliateId}
                      onChange={handleInputChange}
                      style={styles.select}
                      disabled={loading}
                    >
                      <option value="">Select an affiliate (optional)</option>
                      {affiliates.map(affiliate => (
                        <option key={affiliate.id} value={affiliate.id}>
                          {affiliate.first_name} {affiliate.last_name} - {affiliate.company_name} ({affiliate.unique_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <DollarSign style={{ width: '16px', height: '16px' }} />
                      Estimated Amount
                    </label>
                    <input
                      type="number"
                      name="estimatedAmount"
                      value={formData.estimatedAmount}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Initial Status
                    </label>
                    <div style={styles.statusBadge}>
                      New Lead - Starting pipeline stage
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="Additional notes about this client..."
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Upload style={{ width: '16px', height: '16px' }} />
                    Upload Files (JPG, PNG, PDF, DOC)
                  </label>
                  <div 
                    style={styles.fileUpload}
                    onClick={() => document.getElementById('fileInput').click()}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    <Upload style={{ width: '24px', height: '24px', color: '#6b7280', margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      Click to upload files or drag and drop
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                      Maximum 10MB per file
                    </p>
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    style={styles.fileInput}
                    disabled={loading}
                  />

                  {uploadedFiles.length > 0 && (
                    <div style={styles.fileList}>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} style={styles.fileItem}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                            <span style={{ fontSize: '14px', color: '#374151' }}>
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            disabled={loading}
                          >
                            <X style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      ...styles.button,
                      ...styles.cancelButton
                    }}
                    disabled={loading}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.button,
                      ...styles.submitButton,
                      ...(loading ? styles.submitButtonDisabled : {})
                    }}
                    disabled={loading}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#15803d';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#16a34a';
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 style={styles.spinner} />
                        Creating Client...
                      </>
                    ) : (
                      'Create Client'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewClientModal;
