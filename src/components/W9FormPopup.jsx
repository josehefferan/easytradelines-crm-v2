import React, { useState, useRef } from 'react';
import { X, Download, FileText, Save, Check } from 'lucide-react';

const W9FormPopup = ({ isOpen, onClose, affiliateData, onFormComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({
    // Part I - Basic Information
    name: `${affiliateData?.first_name || ''} ${affiliateData?.last_name || ''}`.trim(),
    businessName: '',
    taxClassification: '',
    llcClassification: '',
    otherClassification: '',
    foreignPartners: false,
    exemptPayeeCode: '',
    fatcaCode: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Requester Information
    requesterName: 'Smart Latinos Consulting Group, LLC',
    requesterAddress: '777 NW 72ND AVE, STE 2008 MIAMI, FL 33126',
    accountNumbers: '',
    
    // TIN Information
    ssn: '',
    ein: '',
    
    // Certification
    certifyTin: true,
    certifyBackupWithholding: true,
    certifyUsPerson: true,
    certifyFatca: true,
    
    // Signature
    signature: '',
    signatureDate: ''
  });

  const [errors, setErrors] = useState({});

  const taxClassifications = [
    { value: 'individual', label: 'Individual/sole proprietor' },
    { value: 'ccorp', label: 'C Corporation' },
    { value: 'scorp', label: 'S Corporation' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'trust', label: 'Trust/estate' },
    { value: 'llc', label: 'Limited liability company (LLC)' },
    { value: 'other', label: 'Other (see instructions)' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.taxClassification) newErrors.taxClassification = 'Tax classification is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    // TIN validation
    if (!formData.ssn.trim() && !formData.ein.trim()) {
      newErrors.tin = 'Either SSN or EIN is required';
    }

    // SSN format validation
    if (formData.ssn && !/^\d{3}-?\d{2}-?\d{4}$/.test(formData.ssn.replace(/\s/g, ''))) {
      newErrors.ssn = 'Please enter a valid SSN (XXX-XX-XXXX)';
    }

    // EIN format validation
    if (formData.ein && !/^\d{2}-?\d{7}$/.test(formData.ein.replace(/\s/g, ''))) {
      newErrors.ein = 'Please enter a valid EIN (XX-XXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const completedFormData = {
      ...formData,
      signatureDate: new Date().toLocaleDateString('en-US'),
      completionDate: new Date().toISOString()
    };

    setIsCompleted(true);
    onFormComplete(completedFormData);
  };

  const downloadPDF = () => {
    // Aquí implementarías la generación del PDF del W-9 completado
    alert('PDF generation would be implemented here with jsPDF library');
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '95vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f8fafc'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoSvg: {
      width: '40px',
      height: '40px'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#2E7D32'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    headerButtons: {
      display: 'flex',
      gap: '8px'
    },
    headerButton: {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s'
    },
    downloadButton: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    closeButton: {
      backgroundColor: 'transparent',
      color: '#6b7280'
    },
    content: {
      padding: '32px',
      maxHeight: 'calc(95vh - 200px)',
      overflowY: 'auto',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#374151'
    },
    formTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#1f2937',
      marginBottom: '8px'
    },
    formSubtitle: {
      fontSize: '16px',
      textAlign: 'center',
      color: '#6b7280',
      marginBottom: '24px'
    },
    section: {
      marginBottom: '24px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#fafafa'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '16px',
      textTransform: 'uppercase',
      borderBottom: '2px solid #2563eb',
      paddingBottom: '4px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    fullRow: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
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
    select: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none'
    },
    checkbox: {
      width: '16px',
      height: '16px',
      marginRight: '8px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      color: '#374151',
      marginBottom: '8px'
    },
    errorText: {
      fontSize: '12px',
      color: '#ef4444',
      marginTop: '4px'
    },
    instructionText: {
      fontSize: '12px',
      color: '#6b7280',
      fontStyle: 'italic',
      marginTop: '4px'
    },
    tinSection: {
      display: 'flex',
      gap: '16px',
      alignItems: 'end'
    },
    tinBox: {
      flex: 1,
      padding: '16px',
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      textAlign: 'center'
    },
    certificationSection: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fbbf24',
      borderRadius: '8px',
      padding: '20px'
    },
    certificationText: {
      fontSize: '13px',
      lineHeight: '1.5',
      marginBottom: '16px'
    },
    signatureArea: {
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '2px solid #e5e7eb'
    },
    signatureInput: {
      padding: '12px',
      border: '2px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      fontFamily: 'cursive',
      width: '100%',
      backgroundColor: 'white'
    },
    completedIndicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#16a34a',
      fontWeight: '600',
      padding: '12px',
      backgroundColor: '#ecfdf5',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    footer: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    footerLeft: {
      fontSize: '12px',
      color: '#6b7280',
      lineHeight: '1.4'
    },
    footerCompany: {
      fontWeight: '600',
      color: '#1f2937'
    },
    footerButtons: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    saveButton: {
      backgroundColor: '#16a34a',
      color: 'white'
    },
    cancelButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    }
  };

  const LogoSVG = () => (
    <svg style={styles.logoSvg} viewBox="0 0 120 60">
      <rect x="8" y="35" width="12" height="20" fill="#FF6B35" rx="2"/>
      <rect x="24" y="25" width="12" height="30" fill="#FFB800" rx="2"/>
      <rect x="40" y="15" width="12" height="40" fill="#7CB342" rx="2"/>
      <path d="M45 8 L65 8 L60 3 M65 8 L60 13" 
            stroke="#2E7D32" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
      <text x="75" y="25" 
            fill="#2E7D32" 
            fontSize="14" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif">EASY</text>
      <text x="75" y="42" 
            fill="#2E7D32" 
            fontSize="14" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif">TRADELINES</text>
    </svg>
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logo}>
              <LogoSVG />
              <div>
                <div style={styles.logoText}>EASY TRADELINES</div>
                <div style={styles.title}>Form W-9 Request for Taxpayer ID</div>
              </div>
            </div>
          </div>
          <div style={styles.headerButtons}>
            <button 
              onClick={downloadPDF}
              style={{...styles.headerButton, ...styles.downloadButton}}
            >
              <Download size={16} />
              Download PDF
            </button>
            <button 
              onClick={onClose} 
              style={{...styles.headerButton, ...styles.closeButton}}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <h1 style={styles.formTitle}>Form W-9</h1>
          <p style={styles.formSubtitle}>
            Request for Taxpayer Identification Number and Certification
          </p>

          {isCompleted && (
            <div style={styles.completedIndicator}>
              <Check size={20} />
              W-9 Form completed successfully on {getCurrentDate()}
            </div>
          )}

          {/* Basic Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>
            
            <div style={styles.fullRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  1. Name (as shown on your income tax return)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    ...styles.input,
                    ...(errors.name ? styles.inputError : {})
                  }}
                  placeholder="Enter your full name"
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>
            </div>

            <div style={styles.fullRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  2. Business name/disregarded entity name, if different from above
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  style={styles.input}
                  placeholder="Enter business name (if applicable)"
                />
              </div>
            </div>
          </div>

          {/* Tax Classification */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Federal Tax Classification</h3>
            
            <div style={styles.fullRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  3a. Check the appropriate box for federal tax classification
                </label>
                <select
                  value={formData.taxClassification}
                  onChange={(e) => setFormData({...formData, taxClassification: e.target.value})}
                  style={{
                    ...styles.select,
                    ...(errors.taxClassification ? styles.inputError : {})
                  }}
                >
                  <option value="">Select tax classification</option>
                  {taxClassifications.map(classification => (
                    <option key={classification.value} value={classification.value}>
                      {classification.label}
                    </option>
                  ))}
                </select>
                {errors.taxClassification && <span style={styles.errorText}>{errors.taxClassification}</span>}
              </div>
            </div>

            {formData.taxClassification === 'llc' && (
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    LLC Classification (C = C corporation, S = S corporation, P = Partnership)
                  </label>
                  <input
                    type="text"
                    value={formData.llcClassification}
                    onChange={(e) => setFormData({...formData, llcClassification: e.target.value})}
                    style={styles.input}
                    placeholder="Enter C, S, or P"
                    maxLength="1"
                  />
                </div>
              </div>
            )}

            {formData.taxClassification === 'other' && (
              <div style={styles.fullRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Other classification (see instructions)
                  </label>
                  <input
                    type="text"
                    value={formData.otherClassification}
                    onChange={(e) => setFormData({...formData, otherClassification: e.target.value})}
                    style={styles.input}
                    placeholder="Specify other classification"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Exemptions */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Exemptions</h3>
            
            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>4. Exempt payee code (if any)</label>
                <input
                  type="text"
                  value={formData.exemptPayeeCode}
                  onChange={(e) => setFormData({...formData, exemptPayeeCode: e.target.value})}
                  style={styles.input}
                  placeholder="Enter code if applicable"
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>FATCA reporting code (if any)</label>
                <input
                  type="text"
                  value={formData.fatcaCode}
                  onChange={(e) => setFormData({...formData, fatcaCode: e.target.value})}
                  style={styles.input}
                  placeholder="Enter FATCA code if applicable"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Address</h3>
            
            <div style={styles.fullRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>5. Address (number, street, and apt. or suite no.)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={{
                    ...styles.input,
                    ...(errors.address ? styles.inputError : {})
                  }}
                  placeholder="Enter your address"
                />
                {errors.address && <span style={styles.errorText}>{errors.address}</span>}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>6. City, state, and ZIP code</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    style={{
                      ...styles.input,
                      flex: 2,
                      ...(errors.city ? styles.inputError : {})
                    }}
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    style={{
                      ...styles.input,
                      flex: 1,
                      ...(errors.state ? styles.inputError : {})
                    }}
                    placeholder="State"
                    maxLength="2"
                  />
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    style={{
                      ...styles.input,
                      flex: 1,
                      ...(errors.zipCode ? styles.inputError : {})
                    }}
                    placeholder="ZIP"
                  />
                </div>
                {(errors.city || errors.state || errors.zipCode) && (
                  <span style={styles.errorText}>All address fields are required</span>
                )}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>7. List account number(s) here (optional)</label>
                <input
                  type="text"
                  value={formData.accountNumbers}
                  onChange={(e) => setFormData({...formData, accountNumbers: e.target.value})}
                  style={styles.input}
                  placeholder="Account numbers if applicable"
                />
              </div>
            </div>
          </div>

          {/* Taxpayer Identification Number */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Part I. Taxpayer Identification Number (TIN)</h3>
            
            <div style={styles.tinSection}>
              <div style={styles.tinBox}>
                <label style={styles.label}>Social Security Number</label>
                <input
                  type="text"
                  value={formData.ssn}
                  onChange={(e) => setFormData({...formData, ssn: e.target.value})}
                  style={{
                    ...styles.input,
                    marginTop: '8px',
                    ...(errors.ssn ? styles.inputError : {})
                  }}
                  placeholder="XXX-XX-XXXX"
                />
                {errors.ssn && <span style={styles.errorText}>{errors.ssn}</span>}
              </div>
              
              <div style={{textAlign: 'center', alignSelf: 'center', fontWeight: 'bold'}}>
                OR
              </div>
              
              <div style={styles.tinBox}>
                <label style={styles.label}>Employer Identification Number</label>
                <input
                  type="text"
                  value={formData.ein}
                  onChange={(e) => setFormData({...formData, ein: e.target.value})}
                  style={{
                    ...styles.input,
                    marginTop: '8px',
                    ...(errors.ein ? styles.inputError : {})
                  }}
                  placeholder="XX-XXXXXXX"
                />
                {errors.ein && <span style={styles.errorText}>{errors.ein}</span>}
              </div>
            </div>
            
            {errors.tin && <span style={styles.errorText}>{errors.tin}</span>}
          </div>

          {/* Certification */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Part II. Certification</h3>
            
            <div style={styles.certificationSection}>
              <div style={styles.certificationText}>
                Under penalties of perjury, I certify that:
              </div>
              
              <div style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.certifyTin}
                  onChange={(e) => setFormData({...formData, certifyTin: e.target.checked})}
                  style={styles.checkbox}
                />
                1. The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and
              </div>
              
              <div style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.certifyBackupWithholding}
                  onChange={(e) => setFormData({...formData, certifyBackupWithholding: e.target.checked})}
                  style={styles.checkbox}
                />
                2. I am not subject to backup withholding because (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding; and
              </div>
              
              <div style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.certifyUsPerson}
                  onChange={(e) => setFormData({...formData, certifyUsPerson: e.target.checked})}
                  style={styles.checkbox}
                />
                3. I am a U.S. citizen or other U.S. person; and
              </div>
              
              <div style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.certifyFatca}
                  onChange={(e) => setFormData({...formData, certifyFatca: e.target.checked})}
                  style={styles.checkbox}
                />
                4. The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.
              </div>
            </div>

            {/* Signature */}
            <div style={styles.signatureArea}>
              <label style={styles.label}>Signature of U.S. person</label>
              <input
                type="text"
                value={formData.signature}
                onChange={(e) => setFormData({...formData, signature: e.target.value})}
                style={styles.signatureInput}
                placeholder="Type your full name as electronic signature"
              />
              <div style={{marginTop: '8px', fontSize: '12px', color: '#6b7280'}}>
                Date: {getCurrentDate()}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.footerLeft}>
            <div style={styles.footerCompany}>SMART LATINOS CONSULTING GROUP, LLC</div>
            <div>777 NW 72ND AVE, STE 2008 MIAMI, FL 33126</div>
            <div>info@easytradelines.com</div>
          </div>
          
          <div style={styles.footerButtons}>
            <button
              onClick={onClose}
              style={{...styles.button, ...styles.cancelButton}}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{...styles.button, ...styles.saveButton}}
            >
              <Save size={16} />
              Complete W-9 Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default W9FormPopup;
