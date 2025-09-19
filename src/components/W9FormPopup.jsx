import React, { useState } from 'react';
import { X, Download, Save, Check } from 'lucide-react';

const W9FormPopup = ({ isOpen, onClose, affiliateData, onFormComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({
    // Line 1 - Name
    name: `${affiliateData?.first_name || ''} ${affiliateData?.last_name || ''}`.trim(),
    
    // Line 2 - Business name
    businessName: '',
    
    // Line 3a - Tax classification
    individual: false,
    corporation: false,
    scorporation: false,
    partnership: false,
    trustEstate: false,
    llc: false,
    llcClassification: '',
    other: false,
    otherDescription: '',
    
    // Line 3b - Foreign partners
    foreignPartners: false,
    
    // Line 4 - Exemptions
    exemptPayeeCode: '',
    fatcaCode: '',
    
    // Line 5-6 - Address
    address: '',
    cityStateZip: '',
    
    // Requester info
    requesterName: '',
    requesterAddress: '',
    
    // Line 7 - Account numbers
    accountNumbers: '',
    
    // Part I - TIN
    ssn1: '', ssn2: '', ssn3: '',
    ein1: '', ein2: '',
    
    // Part II - Certification
    signature: '',
    date: new Date().toLocaleDateString('en-US')
  });

  const handleSubmit = () => {
    setIsCompleted(true);
    onFormComplete({
      ...formData,
      completionDate: new Date().toISOString()
    });
  };

  const downloadPDF = () => {
    alert('PDF generation would be implemented here to create official W-9 PDF');
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
      maxWidth: '850px',
      width: '100%',
      maxHeight: '95vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    header: {
      padding: '16px 24px',
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
      gap: '4px'
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
      padding: '24px',
      maxHeight: 'calc(95vh - 140px)',
      overflowY: 'auto',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.4'
    },
    formHeader: {
      textAlign: 'center',
      marginBottom: '20px',
      borderBottom: '2px solid #000',
      paddingBottom: '10px'
    },
    formTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      margin: '0 0 4px 0'
    },
    formSubtitle: {
      fontSize: '14px',
      margin: '0 0 4px 0'
    },
    deptInfo: {
      fontSize: '11px',
      margin: 0
    },
    instructionText: {
      fontSize: '11px',
      marginBottom: '16px',
      textAlign: 'right'
    },
    beforeSection: {
      backgroundColor: '#f0f0f0',
      padding: '8px',
      marginBottom: '16px',
      fontSize: '11px'
    },
    line: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      minHeight: '24px'
    },
    lineNumber: {
      width: '20px',
      fontWeight: 'bold',
      fontSize: '11px'
    },
    lineContent: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    input: {
      border: 'none',
      borderBottom: '1px solid #000',
      padding: '2px 4px',
      fontSize: '12px',
      backgroundColor: 'transparent',
      outline: 'none'
    },
    longInput: {
      flex: 1,
      minWidth: '200px'
    },
    shortInput: {
      width: '40px'
    },
    checkbox: {
      width: '12px',
      height: '12px',
      marginRight: '4px'
    },
    checkboxGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginTop: '8px'
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '11px'
    },
    tinBox: {
      border: '2px solid #000',
      padding: '12px',
      margin: '8px 0',
      textAlign: 'center'
    },
    tinTitle: {
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    tinInputGroup: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px'
    },
    tinInput: {
      border: 'none',
      borderBottom: '2px solid #000',
      width: '30px',
      textAlign: 'center',
      fontSize: '14px',
      padding: '4px 2px'
    },
    dash: {
      fontSize: '16px',
      fontWeight: 'bold'
    },
    certificationBox: {
      border: '2px solid #000',
      padding: '16px',
      margin: '16px 0',
      backgroundColor: '#f9f9f9'
    },
    certificationTitle: {
      fontWeight: 'bold',
      marginBottom: '12px',
      fontSize: '12px'
    },
    certificationText: {
      fontSize: '11px',
      lineHeight: '1.4',
      marginBottom: '16px'
    },
    signatureArea: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '16px',
      paddingTop: '8px',
      borderTop: '1px solid #ccc'
    },
    signatureField: {
      flex: 1,
      marginRight: '20px'
    },
    dateField: {
      width: '120px'
    },
    signatureLabel: {
      fontSize: '10px',
      marginBottom: '4px'
    },
    signatureLine: {
      borderBottom: '1px solid #000',
      height: '24px',
      position: 'relative'
    },
    signatureInput: {
      width: '100%',
      border: 'none',
      fontSize: '14px',
      fontFamily: 'cursive',
      position: 'absolute',
      bottom: '2px',
      backgroundColor: 'transparent',
      outline: 'none'
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    footerInfo: {
      fontSize: '10px',
      color: '#666'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    saveButton: {
      backgroundColor: '#16a34a',
      color: 'white'
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
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.title}>Form W-9 (Rev. March 2024)</div>
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
          {isCompleted && (
            <div style={styles.completedIndicator}>
              <Check size={20} />
              Form W-9 completed successfully
            </div>
          )}

          <div style={styles.formHeader}>
            <div style={styles.formTitle}>Form W-9</div>
            <div style={styles.formSubtitle}>(Rev. March 2024)</div>
            <div style={styles.formSubtitle}>Request for Taxpayer Identification Number and Certification</div>
            <div style={styles.deptInfo}>Department of the Treasury Internal Revenue Service</div>
          </div>

          <div style={styles.instructionText}>
            Go to www.irs.gov/FormW9 for instructions and the latest information.
          </div>

          <div style={styles.beforeSection}>
            <strong>Before you begin.</strong> For guidance related to the purpose of Form W-9, see Purpose of Form, below. Print or type. See Specific Instructions on page 3.
          </div>

          {/* Line 1 */}
          <div style={styles.line}>
            <div style={styles.lineNumber}>1</div>
            <div style={styles.lineContent}>
              Name of entity/individual. An entry is required.
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{...styles.input, ...styles.longInput}}
              />
            </div>
          </div>

          {/* Line 2 */}
          <div style={styles.line}>
            <div style={styles.lineNumber}>2</div>
            <div style={styles.lineContent}>
              Business name/disregarded entity name, if different from above.
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                style={{...styles.input, ...styles.longInput}}
              />
            </div>
          </div>

          {/* Line 3a */}
          <div style={styles.line}>
            <div style={styles.lineNumber}>3a</div>
            <div style={styles.lineContent}>
              Check the appropriate box for federal tax classification of the entity/individual whose name is entered on line 1. Check only one of the following seven boxes.
              <div style={styles.checkboxGroup}>
                <div style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.individual}
                    onChange={(e) => setFormData({...formData, individual: e.target.checked})}
                    style={styles.checkbox}
                  />
                  Individual/sole proprietor
                </div>
                <div style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.corporation}
                    onChange={(e) => setFormData({...formData, corporation: e.target.checked})}
                    style={styles.checkbox}
                  />
                  C corporation
                </div>
                <div style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.scorporation}
                    onChange={(e) => setFormData({...formData, scorporation: e.target.checked})}
                    style={styles.checkbox}
                  />
                  S corporation
                </div>
                <div style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.partnership}
                    onChange={(e) => setFormData({...formData, partnership: e.target.checked})}
                    style={styles.checkbox}
                  />
                  Partnership
                </div>
                <div style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.trustEstate}
                    onChange={(e) => setFormData({...formData, trustEstate: e.target.checked})}
                    style={styles.checkbox}
                  />
                  Trust/estate
                </div>
                <div style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.llc}
                    onChange={(e) => setFormData({...formData, llc: e.target.checked})}
                    style={styles.checkbox}
                  />
                  LLC. Enter the tax classification
                  <input
                    type="text"
                    value={formData.llcClassification}
                    onChange={(e) => setFormData({...formData, llcClassification: e.target.value})}
                    style={{...styles.input, width: '60px', marginLeft: '4px'}}
                    placeholder="C, S, or P"
                  />
                </div>
                <div style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={formData.other}
                    onChange={(e) => setFormData({...formData, other: e.target.checked})}
                    style={styles.checkbox}
                  />
                  Other
                  <input
                    type="text"
                    value={formData.otherDescription}
                    onChange={(e) => setFormData({...formData, otherDescription: e.target.value})}
                    style={{...styles.input, width: '120px', marginLeft: '4px'}}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line 3b */}
          <div style={styles.line}>
            <div style={styles.lineNumber}>3b</div>
            <div style={styles.lineContent}>
              <input
                type="checkbox"
                checked={formData.foreignPartners}
                onChange={(e) => setFormData({...formData, foreignPartners: e.target.checked})}
                style={styles.checkbox}
              />
              If on line 3a you checked "Partnership" or "Trust/estate," check this box if you have any foreign partners, owners, or beneficiaries.
            </div>
          </div>

          {/* Line 4 */}
          <div style={styles.line}>
            <div style={styles.lineNumber}>4</div>
            <div style={styles.lineContent}>
              Exemptions (codes apply only to certain entities, not individuals):
              <span style={{marginLeft: '16px'}}>
                Exempt payee code (if any)
                <input
                  type="text"
                  value={formData.exemptPayeeCode}
                  onChange={(e) => setFormData({...formData, exemptPayeeCode: e.target.value})}
                  style={{...styles.input, width: '60px', marginLeft: '8px'}}
                />
              </span>
              <span style={{marginLeft: '16px'}}>
                Exemption from FATCA reporting code (if any)
                <input
                  type="text"
                  value={formData.fatcaCode}
                  onChange={(e) => setFormData({...formData, fatcaCode: e.target.value})}
                  style={{...styles.input, width: '60px', marginLeft: '8px'}}
                />
              </span>
            </div>
          </div>

          {/* Line 5 */}
          <div style={styles.line}>
            <div style={styles.lineNumber}>5</div>
            <div style={styles.lineContent}>
              Address (number, street, and apt. or suite no.). See instructions.
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                style={{...styles.input, ...styles.longInput}}
              />
            </div>
          </div>

          {/* Line 6 */}
          <div style={styles.line}>
            <div style={styles.lineNumber}>6</div>
            <div style={styles.lineContent}>
              City, state, and ZIP code
              <input
                type="text"
                value={formData.cityStateZip}
                onChange={(e) => setFormData({...formData, cityStateZip: e.target.value})}
                style={{...styles.input, ...styles.longInput}}
              />
            </div>
          </div>

          {/* Requester section */}
          <div style={{margin: '16px 0', fontSize: '11px'}}>
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>Requester's name and address (optional)</div>
            <input
              type="text"
              value={formData.requesterName}
              onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
              style={{...styles.input, width: '100%', marginBottom: '4px'}}
              placeholder="Smart Latinos Consulting Group, LLC"
            />
            <input
              type="text"
              value={formData.requesterAddress}
              onChange={(e) => setFormData({...formData, requesterAddress: e.target.value})}
              style={{...styles.input, width: '100%'}}
              placeholder="777 NW 72ND AVE, STE 2008 MIAMI, FL 33126"
            />
          </div>

          {/* Line 7 */}
          <div style={styles.line}>
            <div style={styles.lineNumber}>7</div>
            <div style={styles.lineContent}>
              List account number(s) here (optional)
              <input
                type="text"
                value={formData.accountNumbers}
                onChange={(e) => setFormData({...formData, accountNumbers: e.target.value})}
                style={{...styles.input, ...styles.longInput}}
              />
            </div>
          </div>

          {/* Part I - TIN */}
          <div style={styles.tinBox}>
            <div style={styles.tinTitle}>Part I Taxpayer Identification Number (TIN)</div>
            <div style={{fontSize: '11px', marginBottom: '12px'}}>
              Enter your TIN in the appropriate box. The TIN provided must match the name given on line 1 to avoid backup withholding.
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
              <div>
                <div style={{marginBottom: '8px'}}>Social security number</div>
                <div style={styles.tinInputGroup}>
                  <input
                    type="text"
                    value={formData.ssn1}
                    onChange={(e) => setFormData({...formData, ssn1: e.target.value})}
                    style={styles.tinInput}
                    maxLength="3"
                  />
                  <span style={styles.dash}>–</span>
                  <input
                    type="text"
                    value={formData.ssn2}
                    onChange={(e) => setFormData({...formData, ssn2: e.target.value})}
                    style={{...styles.tinInput, width: '24px'}}
                    maxLength="2"
                  />
                  <span style={styles.dash}>–</span>
                  <input
                    type="text"
                    value={formData.ssn3}
                    onChange={(e) => setFormData({...formData, ssn3: e.target.value})}
                    style={{...styles.tinInput, width: '40px'}}
                    maxLength="4"
                  />
                </div>
              </div>
              
              <div style={{fontSize: '16px', fontWeight: 'bold'}}>or</div>
              
              <div>
                <div style={{marginBottom: '8px'}}>Employer identification number</div>
                <div style={styles.tinInputGroup}>
                  <input
                    type="text"
                    value={formData.ein1}
                    onChange={(e) => setFormData({...formData, ein1: e.target.value})}
                    style={{...styles.tinInput, width: '24px'}}
                    maxLength="2"
                  />
                  <span style={styles.dash}>–</span>
                  <input
                    type="text"
                    value={formData.ein2}
                    onChange={(e) => setFormData({...formData, ein2: e.target.value})}
                    style={{...styles.tinInput, width: '70px'}}
                    maxLength="7"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Part II - Certification */}
          <div style={styles.certificationBox}>
            <div style={styles.certificationTitle}>Part II Certification</div>
            <div style={styles.certificationText}>
              Under penalties of perjury, I certify that:
              <br/>1. The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and
              <br/>2. I am not subject to backup withholding because (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and
              <br/>3. I am a U.S. citizen or other U.S. person (defined below); and
              <br/>4. The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.
            </div>
            
            <div style={styles.signatureArea}>
              <div style={styles.signatureField}>
                <div style={styles.signatureLabel}>Signature of U.S. person</div>
                <div style={styles.signatureLine}>
                  <input
                    type="text"
                    value={formData.signature}
                    onChange={(e) => setFormData({...formData, signature: e.target.value})}
                    style={styles.signatureInput}
                    placeholder="Type your full name"
                  />
                </div>
              </div>
              <div style={styles.dateField}>
                <div style={styles.signatureLabel}>Date</div>
                <div style={styles.signatureLine}>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    style={styles.signatureInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.footerInfo}>
            Cat. No. 10231X Form W-9 (Rev. 3-2024)
          </div>
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
  );
};

export default W9FormPopup;
