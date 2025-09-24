import React, { useState } from 'react';
import { X, CreditCard, Building2, Calendar, MapPin, DollarSign } from 'lucide-react';

const CardRegistrationModal = ({ isOpen, onClose, currentUser, onSubmit }) => {
  const [formData, setFormData] = useState({
    bank: '',
    account_limit: '',
    open_date_month: '',
    open_date_year: '',
    statement_date: '',
    card_address: '',
    // Campos solo editables por admin
    default_cycles: '2',
    default_spots: '1',
    payout: '',
    // Metadata
    registered_by: currentUser?.email || '',
    owner_type: currentUser?.role === 'admin' ? 'company' : 'affiliate',
    owner_id: currentUser?.id || '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const isAdmin = currentUser?.role === 'admin';

  const banks = [
    'Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One',
    'American Express', 'Discover', 'US Bank', 'PNC', 'TD Bank',
    'Navy Federal', 'USAA', 'Other'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 30}, (_, i) => currentYear - i);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bank) newErrors.bank = 'Bank is required';
    if (!formData.account_limit) newErrors.account_limit = 'Account limit is required';
    if (!formData.open_date_month) newErrors.open_date_month = 'Open month is required';
    if (!formData.open_date_year) newErrors.open_date_year = 'Open year is required';
    if (!formData.statement_date) newErrors.statement_date = 'Statement date is required';
    if (!formData.card_address) newErrors.card_address = 'Card address is required';
    
    // Validar que account_limit sea un número
    if (formData.account_limit && isNaN(formData.account_limit)) {
      newErrors.account_limit = 'Account limit must be a number';
    }

    // Validar statement_date (debe ser entre 1 y 28)
    if (formData.statement_date) {
      const date = parseInt(formData.statement_date);
      if (date < 1 || date > 28) {
        newErrors.statement_date = 'Statement date must be between 1 and 28';
      }
    }

    // Solo para admin - validar payout
    if (isAdmin && formData.payout && isNaN(formData.payout)) {
      newErrors.payout = 'Payout must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Formatear datos antes de enviar
      const submitData = {
        ...formData,
        account_limit: parseFloat(formData.account_limit),
        statement_date: parseInt(formData.statement_date),
        default_cycles: parseInt(formData.default_cycles),
        default_spots: parseInt(formData.default_spots),
        payout: formData.payout ? parseFloat(formData.payout) : null,
        open_date: `${formData.open_date_month} ${formData.open_date_year}`,
        created_at: new Date().toISOString()
      };

      if (onSubmit) {
        await onSubmit(submitData);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting card registration:', error);
      alert('Error registering card. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CreditCard size={24} style={{ color: '#16a34a' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
              Card Registration
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Bank Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#374151'
            }}>
              Card Information
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Bank */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Bank <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="bank"
                  value={formData.bank}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.bank ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Bank</option>
                  {banks.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                {errors.bank && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.bank}
                  </p>
                )}
              </div>

              {/* Account Limit */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Account Limit <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280'
                  }}>$</span>
                  <input
                    type="text"
                    name="account_limit"
                    value={formData.account_limit}
                    onChange={handleInputChange}
                    placeholder="10000"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 28px',
                      border: errors.account_limit ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                {errors.account_limit && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.account_limit}
                  </p>
                )}
              </div>

              {/* Open Date */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Open Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select
                    name="open_date_month"
                    value={formData.open_date_month}
                    onChange={handleInputChange}
                    style={{
                      padding: '8px 12px',
                      border: errors.open_date_month ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    name="open_date_year"
                    value={formData.open_date_year}
                    onChange={handleInputChange}
                    style={{
                      padding: '8px 12px',
                      border: errors.open_date_year ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {(errors.open_date_month || errors.open_date_year) && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    Please select both month and year
                  </p>
                )}
              </div>

              {/* Statement Date */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Statement Date (Day of Month) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  name="statement_date"
                  value={formData.statement_date}
                  onChange={handleInputChange}
                  placeholder="15"
                  min="1"
                  max="28"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.statement_date ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.statement_date && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.statement_date}
                  </p>
                )}
              </div>

              {/* Card Address */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Card Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="card_address"
                  value={formData.card_address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State ZIP"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.card_address ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {errors.card_address && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.card_address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Only Section */}
          <div style={{ 
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: isAdmin ? '#fef3c7' : '#f3f4f6',
            borderRadius: '8px',
            border: `1px solid ${isAdmin ? '#fbbf24' : '#e5e7eb'}`
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#374151'
            }}>
              Configuration {!isAdmin && '(Admin Only)'}
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Default Cycles */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Default Cycles
                </label>
                <input
                  type="number"
                  name="default_cycles"
                  value={formData.default_cycles}
                  onChange={handleInputChange}
                  disabled={!isAdmin}
                  min="1"
                  max="12"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: !isAdmin ? '#f9fafb' : 'white',
                    cursor: !isAdmin ? 'not-allowed' : 'text'
                  }}
                />
              </div>

              {/* Default Spots */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Default Spots
                </label>
                <input
                  type="number"
                  name="default_spots"
                  value={formData.default_spots}
                  onChange={handleInputChange}
                  disabled={!isAdmin}
                  min="1"
                  max="10"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: !isAdmin ? '#f9fafb' : 'white',
                    cursor: !isAdmin ? 'not-allowed' : 'text'
                  }}
                />
              </div>

              {/* Payout */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Payout Amount
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280'
                  }}>$</span>
                  <input
                    type="text"
                    name="payout"
                    value={formData.payout}
                    onChange={handleInputChange}
                    disabled={!isAdmin}
                    placeholder="150"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 28px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: !isAdmin ? '#f9fafb' : 'white',
                      cursor: !isAdmin ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
                {errors.payout && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.payout}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={16} />
              Register Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardRegistrationModal;
