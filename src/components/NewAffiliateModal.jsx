import React, { useState } from 'react';
import { X, Building2, Mail, Phone, DollarSign, User, Loader2 } from 'lucide-react';
import { profileService } from '../services/supabaseServices';

const NewAffiliateModal = ({ isOpen, onClose, currentUser, onAffiliateCreated }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    commissionRate: '8.00'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error al escribir
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Please enter a valid email';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!formData.company.trim()) return 'Company name is required';
    if (!formData.commissionRate || parseFloat(formData.commissionRate) < 0) {
      return 'Commission rate must be a positive number';
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
      const { data, error: createError } = await profileService.createAffiliate({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        commissionRate: parseFloat(formData.commissionRate)
      });

      if (createError) {
        throw new Error(createError);
      }

      setSuccess('Affiliate created successfully!');
      
      // Limpiar formulario
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        commissionRate: '8.00'
      });

      // Notificar al componente padre
      if (onAffiliateCreated) {
        onAffiliateCreated(data);
      }

      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to create affiliate. Please try again.');
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
        company: '',
        commissionRate: '8.00'
      });
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
      maxWidth: '500px',
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
    inputFocus: {
      borderColor: '#7c3aed',
      boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)'
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
      backgroundColor: '#7c3aed',
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
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    infoBox: {
      backgroundColor: '#faf5ff',
      border: '1px solid #e9d5ff',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '13px',
      color: '#6b21a8'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Building2 style={{ width: '24px', height: '24px', color: '#7c3aed' }} />
            <div>
              <h2 style={styles.title}>New Affiliate</h2>
              <p style={styles.subtitle}>Add a new affiliate partner to the system</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={styles.closeButton}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={styles.content}>
          {error && (
            <div style={styles.alertError}>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.alertSuccess}>
              {success}
            </div>
          )}

          <div style={styles.infoBox}>
            💡 Affiliates can refer clients and earn commission on successful sales. 
            Default commission rate is 8% but can be customized per affiliate.
          </div>

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
                placeholder="affiliate@company.com"
                disabled={loading}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Building2 style={{ width: '16px', height: '16px' }} />
                Company Name *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Affiliate Company LLC"
                disabled={loading}
                required
              />
            </div>

            <div style={styles.row}>
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

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <DollarSign style={{ width: '16px', height: '16px' }} />
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="8.00"
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={loading}
                />
              </div>
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
                    e.target.style.backgroundColor = '#6d28d9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#7c3aed';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Affiliate'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAffiliateModal;
