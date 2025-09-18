import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle, CreditCard, Download, Upload } from 'lucide-react';

const NewAffiliateModal = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    chName: '',
    phoneNumber: '',
    email: '',
    address: '',
    preferredPayment: ''
  });

  const [files, setFiles] = useState({
    w9Document: null
  });

  const [uploadStatus, setUploadStatus] = useState({
    w9Document: 'pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const generateAffiliateFolio = async () => {
    const timestamp = Date.now();
    const lastDigits = timestamp.toString().slice(-6);
    return `A-${lastDigits}`;
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

  const handleFileUpload = (file) => {
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension) || file.size > 10 * 1024 * 1024) {
      setUploadStatus(prev => ({
        ...prev,
        w9Document: 'error'
      }));
      return;
    }

    setUploadStatus(prev => ({
      ...prev,
      w9Document: 'uploading'
    }));

    setTimeout(() => {
      setFiles(prev => ({
        ...prev,
        w9Document: file
      }));
      setUploadStatus(prev => ({
        ...prev,
        w9Document: 'success'
      }));
    }, 1500);
  };

  const handleDownloadAgreement = () => {
    // Simulate download of affiliate agreement
    const link = document.createElement('a');
    link.href = '#'; // In real implementation, this would be the actual agreement file URL
    link.download = 'EasyTradelines_Affiliate_Agreement.pdf';
    link.click();
    
    alert('Affiliate Agreement downloaded! Please sign and prepare to upload.');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.chName.trim()) newErrors.chName = 'Card Holder name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.preferredPayment.trim()) newErrors.preferredPayment = 'Preferred payment method is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // File validation
    if (uploadStatus.w9Document !== 'success') {
      newErrors.w9Document = 'Completed W-9 document is required';
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
      const affiliateFolio = await generateAffiliateFolio();
      
      const affiliateData = {
        ...formData,
        folio: affiliateFolio,
        status: 'affiliate_registrado', // Initial status (33% purple)
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        progress: 33, // 33% for affiliate_registrado status
        statusColor: '#a855f7' // Purple color
      };

      console.log('Affiliate Data:', affiliateData);
      console.log('Files:', files);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Affiliate registered successfully with folio: ${affiliateFolio}\nStatus: Affiliate Registrado (33% - Pending Review)\nNext: Upload signed agreement when ready.`);
      onClose();
      
    } catch (error) {
      console.error('Error creating affiliate:', error);
      alert('Error creating affiliate. Please try again.');
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
        maxWidth: '700px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CreditCard style={{ width: '24px', height: '24px', color: '#a855f7' }} />
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              New Affiliate Registration
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

        {/* Content */}
        <div style={{
          padding: '24px',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          {/* Card Holder Information */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CreditCard style={{ width: '20px', height: '20px', color: '#a855f7' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Card Holder Information
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
                  Card Holder Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="chName"
                  value={formData.chName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.chName ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter card holder full name"
                />
                {errors.chName && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.chName}
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
                  placeholder="cardholder@example.com"
                />
                {errors.email && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.email}
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
                  Address <span style={{ color: '#ef4444' }}>*</span>
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
                  placeholder="Enter complete address"
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
                  Preferred Form of Payment <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="preferredPayment"
                  value={formData.preferredPayment}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${errors.preferredPayment ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select payment method</option>
                  <option value="zelle">Zelle</option>
                  <option value="wire">Wire Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
                {errors.preferredPayment && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.preferredPayment}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Required Documents
            </h3>
            
            {/* Download Agreement */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>
                Step 1: Download & Sign Agreement
              </label>
              
              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Download style={{ width: '20px', height: '20px', color: '#059669' }} />
                    <div>
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#1f2937', 
                        margin: 0 
                      }}>
                        Affiliate Agreement
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6b7280', 
                        margin: 0 
                      }}>
                        Download, sign, and prepare to upload
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadAgreement}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: '#059669',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Download style={{ width: '16px', height: '16px' }} />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Upload W-9 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>
                Step 2: Upload Completed W-9 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              
              <div style={{
                border: `2px dashed ${uploadStatus.w9Document === 'success' ? '#10b981' : uploadStatus.w9Document === 'error' ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: uploadStatus.w9Document === 'success' ? '#f0fdf4' : uploadStatus.w9Document === 'error' ? '#fef2f2' : '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  style={{ display: 'none' }}
                  id="upload-w9"
                />
                
                <label htmlFor="upload-w9" style={{ cursor: 'pointer', display: 'block' }}>
                  {uploadStatus.w9Document === 'uploading' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid #a855f7',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span style={{ color: '#a855f7', fontSize: '14px' }}>Uploading...</span>
                    </div>
                  ) : uploadStatus.w9Document === 'success' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Check style={{ width: '24px', height: '24px', color: '#10b981' }} />
                      <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
                        {files.w9Document?.name}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Click to change</span>
                    </div>
                  ) : uploadStatus.w9Document === 'error' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                      <span style={{ color: '#ef4444', fontSize: '14px' }}>Upload failed</span>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Click to try again</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Upload style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                      <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                        Click to upload completed W-9
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>PDF, JPG, PNG, DOC formats</span>
                    </div>
                  )}
                </label>
              </div>
              
              {errors.w9Document && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.w9Document}
                </p>
              )}
            </div>
          </div>

          {/* Process Info */}
          <div style={{ 
            backgroundColor: '#faf5ff', 
            border: '2px solid #e9d5ff', 
            borderRadius: '12px', 
            padding: '16px', 
            marginBottom: '24px' 
          }}>
            <h4 style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#7c3aed', 
              margin: '0 0 8px 0' 
            }}>
              Next Steps After Registration
            </h4>
            <ul style={{ 
              fontSize: '13px', 
              color: '#6b46c1', 
              margin: 0, 
              paddingLeft: '16px' 
            }}>
              <li>Your registration will be reviewed within 24-48 hours</li>
              <li>Once approved, you can access your affiliate panel</li>
              <li>Start adding tradelines to earn commissions</li>
              <li>Track your earnings and payment status</li>
            </ul>
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
                backgroundColor: isSubmitting ? '#9ca3af' : '#a855f7',
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
                  Registering Affiliate...
                </>
              ) : (
                'Register Affiliate'
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

export default NewAffiliateModal;
