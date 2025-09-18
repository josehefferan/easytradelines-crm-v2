import React, { useState } from 'react';
import { X, Upload, FileText, Image, Check, AlertCircle } from 'lucide-react';

const NewClientModal = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phoneNumber: '',
    email: '',
    ssn: '',
    dateOfBirth: '',
    experianLogin: ''
  });

  const [files, setFiles] = useState({
    id: null,
    ssCard: null,
    creditReports: null
  });

  const [uploadStatus, setUploadStatus] = useState({
    id: 'pending',
    ssCard: 'pending',
    creditReports: 'pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const generateClientFolio = async () => {
    const timestamp = Date.now();
    const lastDigits = timestamp.toString().slice(-6);
    return `C-${lastDigits}`;
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

  const handleFileUpload = (fileType, file) => {
    const validations = {
      id: ['jpg', 'jpeg', 'png', 'pdf'],
      ssCard: ['pdf'],
      creditReports: ['pdf']
    };

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validations[fileType].includes(fileExtension)) {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: 'error'
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: 'error'
      }));
      return;
    }

    setUploadStatus(prev => ({
      ...prev,
      [fileType]: 'uploading'
    }));

    setTimeout(() => {
      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: 'success'
      }));
    }, 1500);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.ssn.trim()) newErrors.ssn = 'SSN is required';
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.experianLogin.trim()) newErrors.experianLogin = 'Experian login is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // SSN validation
    if (formData.ssn && !/^\d{3}-?\d{2}-?\d{4}$/.test(formData.ssn)) {
      newErrors.ssn = 'Please enter a valid SSN (XXX-XX-XXXX)';
    }

    // File validations
    if (uploadStatus.id !== 'success') newErrors.id = 'ID document is required';
    if (uploadStatus.ssCard !== 'success') newErrors.ssCard = 'SS Card is required';
    if (uploadStatus.creditReports !== 'success') newErrors.creditReports = 'Credit reports are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const clientFolio = await generateClientFolio();
      
      const clientData = {
        ...formData,
        folio: clientFolio,
        status: 'nuevo_cliente',
        assignedBroker: currentUser?.id || 'demo-broker',
        brokerName: currentUser?.name || 'Demo Broker',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        progress: 10
      };

      console.log('Client Data:', clientData);
      console.log('Files:', files);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Client created successfully with folio: ${clientFolio}`);
      onClose();
      
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadBox = ({ fileType, label, acceptedFormats, description }) => {
    const status = uploadStatus[fileType];
    
    return (
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          display: 'block',
          marginBottom: '8px'
        }}>
          {label} <span style={{ color: '#ef4444' }}>*</span>
        </label>
        
        <div style={{
          border: `2px dashed ${status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#d1d5db'}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: status === 'success' ? '#f0fdf4' : status === 'error' ? '#fef2f2' : '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          <input
            type="file"
            accept={acceptedFormats}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleFileUpload(fileType, file);
              }
            }}
            style={{ display: 'none' }}
            id={`upload-${fileType}`}
          />
          
          <label htmlFor={`upload-${fileType}`} style={{ cursor: 'pointer', display: 'block' }}>
            {status === 'uploading' ? (
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
            ) : status === 'success' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Check style={{ width: '24px', height: '24px', color: '#10b981' }} />
                <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
                  {files[fileType]?.name}
                </span>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>Click to change</span>
              </div>
            ) : status === 'error' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <AlertCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontSize: '14px' }}>Upload failed</span>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>Click to try again</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                {fileType === 'id' ? <Image style={{ width: '24px', height: '24px', color: '#6b7280' }} /> : <FileText style={{ width: '24px', height: '24px', color: '#6b7280' }} />}
                <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                  Click to upload {label}
                </span>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>{description}</span>
              </div>
            )}
          </label>
        </div>
        
        {errors[fileType] && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
            {errors[fileType]}
          </p>
        )}
      </div>
    );
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
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            New Client Registration
          </h2>
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

        {/* Content */}
        <div style={{
          padding: '24px',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          {/* Personal Information Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Personal Information
            </h3>
            
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
                  Email <span style={{ color: '#ef4444' }}>*</span>
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
                  placeholder="Enter email address"
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
            </div>
          </div>

          {/* Experian Information Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Experian Account Information
            </h3>
            
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                display: 'block',
                marginBottom: '4px'
              }}>
                Experian Login/User/Password/Security Answer/4 Digit PIN <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                name="experianLogin"
                value={formData.experianLogin}
                onChange={handleInputChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${errors.experianLogin ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                placeholder="Enter all Experian account details (Login, User, Password, Security Answer, 4-digit PIN)"
              />
              {errors.experianLogin && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.experianLogin}
                </p>
              )}
            </div>
          </div>

          {/* Document Upload Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Required Documents
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              <FileUploadBox
                fileType="id"
                label="ID Document"
                acceptedFormats=".jpg,.jpeg,.png,.pdf"
                description="JPG, PNG, or PDF format"
              />
              
              <FileUploadBox
                fileType="ssCard"
                label="Social Security Card"
                acceptedFormats=".pdf"
                description="PDF format only"
              />
              
              <FileUploadBox
                fileType="creditReports"
                label="3 Bureaus Credit Reports"
                acceptedFormats=".pdf"
                description="PDF format only"
              />
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
                backgroundColor: isSubmitting ? '#9ca3af' : '#16a34a',
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
                  Creating Client...
                </>
              ) : (
                'Create Client'
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

export default NewClientModal;
