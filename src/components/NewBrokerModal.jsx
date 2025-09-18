import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle, Building, User } from 'lucide-react';

const NewBrokerModal = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    companyWebsite: '',
    brokerDirectPhone: '',
    alternateContact: '',
    assistantName: '',
    altPocPhone: '',
    ccPocEmail: '',
    firstName: '',
    lastName: '',
    address: '',
    ssn: '',
    dateOfBirth: '',
    experianLogin: '',
    phoneNumber: '',
    personalEmail: ''
  });

  const [files, setFiles] = useState({
    documents: []
  });

  const [uploadStatus, setUploadStatus] = useState({
    documents: 'pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const generateBrokerFolio = async () => {
    const timestamp = Date.now();
    const lastDigits = timestamp.toString().slice(-6);
    return `B-${lastDigits}`;
  };

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

  const handleFileUpload = (fileList) => {
    const validExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
    const validFiles = [];
    const invalidFiles = [];

    Array.from(fileList).forEach(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (validExtensions.includes(fileExtension) && file.size <= 10 * 1024 * 1024) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setUploadStatus(prev => ({
        ...prev,
        documents: 'error'
      }));
      return;
    }

    setUploadStatus(prev => ({
      ...prev,
      documents: 'uploading'
    }));

    setTimeout(() => {
      setFiles(prev => ({
        ...prev,
        documents: validFiles
      }));
      setUploadStatus(prev => ({
        ...prev,
        documents: 'success'
      }));
    }, 1500);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = 'Company email is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.companyWebsite.trim()) newErrors.companyWebsite = 'Company website is required';
    if (!formData.brokerDirectPhone.trim()) newErrors.brokerDirectPhone = 'Direct phone number is required';
    if (!formData.alternateContact.trim()) newErrors.alternateContact = 'Alternate contact is required';
    if (!formData.assistantName.trim()) newErrors.assistantName = 'Assistant name is required';
    if (!formData.altPocPhone.trim()) newErrors.altPocPhone = 'Alt POC phone is required';
    if (!formData.ccPocEmail.trim()) newErrors.ccPocEmail = 'CC POC email is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.ssn.trim()) newErrors.ssn = 'SSN is required';
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.personalEmail.trim()) newErrors.personalEmail = 'Personal email is required';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid company email';
    }
    if (formData.personalEmail && !/\S+@\S+\.\S+/.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Please enter a valid personal email';
    }
    if (formData.ccPocEmail && !/\S+@\S+\.\S+/.test(formData.ccPocEmail)) {
      newErrors.ccPocEmail = 'Please enter a valid CC POC email';
    }

    if (formData.brokerDirectPhone && !/^\d{10}$/.test(formData.brokerDirectPhone.replace(/\D/g, ''))) {
      newErrors.brokerDirectPhone = 'Please enter a valid 10-digit phone number';
    }
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (formData.ssn && !/^\d{3}-?\d{2}-?\d{4}$/.test(formData.ssn)) {
      newErrors.ssn = 'Please enter a valid SSN (XXX-XX-XXXX)';
    }

    if (formData.companyWebsite && !formData.companyWebsite.includes('.')) {
      newErrors.companyWebsite = 'Please enter a valid website URL';
    }

    if (uploadStatus.documents !== 'success') {
      newErrors.documents = 'At least one document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const brokerFolio = await generateBrokerFolio();
      
      const brokerData = {
        ...formData,
        folio: brokerFolio,
        status: 'nuevo_broker',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        progress: 33,
        statusColor: '#3b82f6'
      };

      console.log('Broker Data:', brokerData);
      console.log('Files:', files);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Broker registered successfully with folio: ${brokerFolio}\nStatus: Nuevo Broker (33% - Pending Review)`);
      onClose();
      
    } catch (error) {
      console.error('Error creating broker:', error);
      alert('Error creating broker. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              New Broker Registration
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: '8px',
              color: '#6b7280'
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <div style={{
          padding: '24px',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          {/* Company Information */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Building style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Company Information
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Company Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="company@example.com"
                />
                {errors.email && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Company Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.companyName ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Company Website/URL <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.companyWebsite ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://company.com"
                />
                {errors.companyWebsite && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.companyWebsite}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Broker Direct Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="brokerDirectPhone"
                  value={formData.brokerDirectPhone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.brokerDirectPhone ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="(555) 123-4567"
                />
                {errors.brokerDirectPhone && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.brokerDirectPhone}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Alternate Contact in Company <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="alternateContact"
                  value={formData.alternateContact}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.alternateContact ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Alternate contact name"
                />
                {errors.alternateContact && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.alternateContact}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Assistant or Other POC Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="assistantName"
                  value={formData.assistantName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.assistantName ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Assistant name"
                />
                {errors.assistantName && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.assistantName}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Alt POC Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="altPocPhone"
                  value={formData.altPocPhone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.altPocPhone ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="(555) 987-6543"
                />
                {errors.altPocPhone && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.altPocPhone}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  CC POC Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  name="ccPocEmail"
                  value={formData.ccPocEmail}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.ccPocEmail ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="cc@company.com"
                />
                {errors.ccPocEmail && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.ccPocEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <User style={{ width: '20px', height: '20px', color: '#059669' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Personal Information
              </h3>
              <span style={{
                fontSize: '12px',
                color: '#f59e0b',
                backgroundColor: '#fef3c7',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                Visible to Card Holder
              </span>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.firstName ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.lastName ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Address (no PO Box/residential only) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.address ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter residential address"
                />
                {errors.address && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.address}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  SSN <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.ssn ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="XXX-XX-XXXX"
                />
                {errors.ssn && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.ssn}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Date of Birth <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.dateOfBirth ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.dateOfBirth && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.phoneNumber ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="(555) 123-4567"
                />
                {errors.phoneNumber && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Personal Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.personalEmail ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="personal@example.com"
                />
                {errors.personalEmail && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.personalEmail}
                  </p>
                )}
              </div>

              {currentUser?.role === 'admin' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Experian Login/User/Password/Security Answer/4 Digit PIN
                    <span style={{
                      fontSize: '12px',
                      color: '#dc2626',
                      backgroundColor: '#fef2f2',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '500',
                      marginLeft: '8px'
                    }}>
                      Admin Only
                    </span>
                  </label>
                  <textarea
                    name="experianLogin"
                    value={formData.experianLogin}
                    onChange={handleInputChange}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                    placeholder="Enter Experian account details (Admin Only)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Required Documents
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>
                Documents <span style={{ color: '#ef4444' }}>*</span>
              </label>
              
              <div style={{
                border: `2px dashed ${uploadStatus.documents === 'success' ? '#10b981' : uploadStatus.documents === 'error' ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: uploadStatus.documents === 'success' ? '#f0fdf4' : uploadStatus.documents === 'error' ? '#fef2f2' : '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  multiple
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="upload-documents"
                />
                
                <label htmlFor="upload-documents" style={{ cursor: 'pointer', display: 'block' }}>
                  {uploadStatus.documents === 'uploading' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid #3b82f6',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span style={{ color: '#3b82f6', fontSize: '14px' }}>Uploading...</span>
                    </div>
                  ) : uploadStatus.documents === 'success' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Check style={{ width: '24px', height: '24px', color: '#10b981' }} />
                      <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
                        {files.documents.length} file(s) uploaded
                      </span>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {files.documents.map(file => file.name).join(', ')}
                      </div>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Click to change</span>
                    </div>
                  ) : uploadStatus.documents === 'error' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                      <span style={{ color: '#ef4444', fontSize: '14px' }}>Upload failed</span>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Click to try again</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FileText style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                      <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                        Click to upload documents
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>JPG, PNG, PDF, DOC formats</span>
                    </div>
                  )}
                </label>
              </div>
              
              {errors.documents && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.documents}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                color: '#374151',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating Broker...
                </>
              ) : (
                'Register Broker'
              )}
            </button>
          </div>
        </div>
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

export default NewBrokerModal;
