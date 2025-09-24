import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, FileText, Check, Download, Edit2 } from 'lucide-react';

const ContractSignaturePopup = ({ isOpen, onClose, brokerData, onSignComplete, currentUser }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [adminSignature, setAdminSignature] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [adminInitials, setAdminInitials] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerInitials, setBrokerInitials] = useState('');
  const [isLocked, setIsLocked] = useState(false);  
const [lockedBy, setLockedBy] = useState('');    
const [lockedDate, setLockedDate] = useState(null); 
  const canvasRef = useRef(null);
  const adminCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAdminDrawing, setIsAdminDrawing] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleLockToggle = () => {
  const newLockState = !isLocked;
  setIsLocked(newLockState);
  setLockedBy(newLockState ? (currentUser?.email || 'Admin') : '');
  setLockedDate(newLockState ? new Date().toISOString() : null);
  
  if (newLockState) {
    alert('Contract has been locked. No further edits are allowed.');
  } else {
    alert('Contract has been unlocked for editing.');
  }
};
  
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      initCanvas(canvasRef);
    }
    if (isOpen && adminCanvasRef.current) {
      initCanvas(adminCanvasRef);
    }
  }, [isOpen]);

  const initCanvas = (canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const startAdminDrawing = (e) => {
    setIsAdminDrawing(true);
    const canvas = adminCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawAdmin = (e) => {
    if (!isAdminDrawing) return;
    
    const canvas = adminCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopAdminDrawing = () => {
    setIsAdminDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
    setSignatureData(null);
  };

  const clearAdminSignature = () => {
    const canvas = adminCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAdminSignature(null);
  };

  const completeSignature = () => {
    if (!brokerName.trim() || !brokerInitials.trim()) {
      alert('Please complete the name and initials');
      return;
    }
    
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas.toDataURL();
    setSignatureData(signatureDataUrl);
    setIsSigned(true);
    
    if (onSignComplete) {
      onSignComplete({
        signatureImage: signatureDataUrl,
        contractData: {
          reseller_name: brokerName,
          reseller_address: brokerData.company_name,
          reseller_phone: brokerData.phone,
          reseller_email: brokerData.email,
          reseller_initials: brokerInitials,
          signature_date: getCurrentDate()
        }
      });
    }
  };

  const completeAdminSignature = () => {
    if (!adminName.trim() || !adminInitials.trim()) {
      alert('Please complete the admin name and initials');
      return;
    }
    
    const canvas = adminCanvasRef.current;
    const adminSignatureDataUrl = canvas.toDataURL();
    setAdminSignature(adminSignatureDataUrl);
  };

  // Función para permitir al admin editar la firma del broker
  const editBrokerSignature = () => {
    setIsSigned(false);
    clearSignature();
  };

  // Función para permitir al admin editar su propia firma
  const editAdminSignature = () => {
    setAdminSignature(null);
    clearAdminSignature();
  };

  const downloadBlankPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = getFullContractHTML(true);

    if (typeof html2pdf !== 'undefined') {
      const options = {
        margin: 0.5,
        filename: `Easy_Tradelines_Agreement_Blank.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(options).from(element).save();
    } else {
      alert('To download the PDF, please include the html2pdf library in your project');
    }
  };

  const downloadSignedPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = getFullContractHTML(false);

    if (typeof html2pdf !== 'undefined') {
      const options = {
        margin: 0.5,
        filename: `Easy_Tradelines_Agreement_${brokerData.first_name}_${brokerData.last_name}_Signed.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(options).from(element).save();
    } else {
      alert('To download the PDF, please include the html2pdf library in your project');
    }
  };

  const getFullContractHTML = (isBlank) => {
  return `
    <div style="padding: 40px; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #000;">
      <h1 style="text-align: center; font-size: 18px; margin-bottom: 30px; text-transform: uppercase; font-weight: bold;">EASY TRADELINES RESELLER AGREEMENT</h1>
      
      <p style="text-align: center; margin-bottom: 30px;">
        This Agreement is entered into on <strong>${isBlank ? '_______________' : getCurrentDate()}</strong>, by and between 
        <strong>SMART LATINOS CONSULTING GROUP LLC</strong>, doing business as Easy Tradelines, 
        hereinafter referred to as "Easy Tradelines", and 
        <strong>${isBlank ? '_______________________________' : `${brokerData.first_name} ${brokerData.last_name}`}</strong> 
        whose address is <strong>${isBlank ? '_______________________________' : brokerData.company_name}</strong>, 
        hereinafter called "Reseller".
      </p>
      
      <h3>PURPOSE OF THE AGREEMENT</h3>
      <p><strong>1.1</strong> Easy Tradelines and Reseller have entered into this Agreement to set forth the terms and conditions under which Easy Tradelines will enable the Reseller to access Easy Tradelines portfolio of third party trade-lines for the sole purpose of attempting to increase the FICO score of Reseller's customers (the Clients).</p>
      <p><strong>1.2</strong> Reseller hereby agrees to be bound to the following terms and conditions regarding all services rendered by Easy Tradelines under this Agreement.</p>
      
      <h3>SERVICES</h3>
      <p><strong>2.1</strong> Easy Tradelines will perform the following services for the benefit of the Reseller:</p>
      <p style="margin-left: 20px;"><strong>a)</strong> Easy Tradeline will make available to Reseller certain credit facilities of third party investors who have agreed to permit Clients to be added as an authorized user to one or more of the Investor's credit facilities (the "Services"). In making the Services available to the Clients, Reseller shall comply with all terms and conditions of the Services established, as may be modified from time to time, by Easy Tradelines, including without limitation, a service manual provided to Reseller by Easy Tradelines (the "Service Manual").</p>
      
      <h3>COVENANTS, REPRESENTATIONS, AND WARRANTIES</h3>
      <p><strong>3.1</strong> Reseller's Covenants, Representations, and Warranties. Reseller covenants, represents and warrants the following:</p>
      <p style="margin-left: 20px;"><strong>a)</strong> All information provided by Reseller to Easy Tradelines in connection with this Agreement and the Services is correct, complete and accurate in all respects.</p>
      <p style="margin-left: 20px;"><strong>b)</strong> Reseller will comply with all terms and conditions of the Services, as established and modified by Easy Tradelines from time to time.</p>
      <p style="margin-left: 20px;"><strong>c)</strong> Reseller has received and reviewed a copy of the current Service Manual prior to entering this Agreement, and will review and comply with any modifications of the Service Manual that Easy Tradelines may issue in the future.</p>
      <p style="margin-left: 20px;"><strong>d)</strong> Reseller will not contact, or make any attempt to contact, any of our Investors, or any co-borrower, lender or other grantor of credit, in connection with a credit facility made available through the Services at any time or for any reason.</p>
      <p style="margin-left: 20px;"><strong>e)</strong> Reseller acknowledges and agrees that Easy Tradelines makes no representation or guarantee that the Services will result in any improvement of a Client's credit score.</p>
      <p style="margin-left: 20px;"><strong>f)</strong> Reseller will promptly notify Easy Tradelines of any material change to Client's name or contact information.</p>
      <p style="margin-left: 20px;"><strong>g)</strong> Reseller will not make any representation to any Client that it is acting for or on behalf of Easy Tradelines.</p>
      <p style="margin-left: 20px;"><strong>h)</strong> Reseller shall undertake a commercially reasonable review of its Clients' application for services, including verification of identity and creditworthiness.</p>
      <p><strong>3.2</strong> Easy Tradelines Covenants, Representations, and Warranties:</p>
      <p style="margin-left: 20px;"><strong>a)</strong> Easy Tradelines does not and cannot guarantee any result or improvement in credit score.</p>
      <p style="margin-left: 20px;"><strong>b)</strong> Easy Tradelines does not and cannot guarantee that any Client will be approved for any loan or credit request.</p>
      <p style="margin-left: 20px;"><strong>c)</strong> Easy Tradelines is not a credit repair company.</p>
      
      <h3>COMPENSATION</h3>
      <p><strong>4.1</strong> In exchange for Easy Tradelines Services under this Agreement, the Reseller agrees to pay to Easy Tradelines a fee equal to the amount shown on the schedule of available credit facilities.</p>
      <p><strong>4.2</strong> No fee for Services is earned by Easy Tradelines or the Investor until and unless the Services are deemed completed.</p>
      
      <h3>TIME FOR PERFORMANCE OF SERVICES</h3>
      <p><strong>5.1</strong> Following execution of this Agreement by the parties, Easy Tradelines will provide Reseller with a schedule of available credit facilities.</p>
      <p><strong>5.2</strong> Reseller acknowledges and agrees that Easy Tradelines is not involved in any manner whatsoever in the determination or assessment of a FICO score.</p>
      
      <h3>LIMITATION OF LIABILITY</h3>
      <p><strong>6.1 THE TOTAL LIABILITY OF EASY TRADELINES SHALL NOT EXCEED THE TOTAL AMOUNT OF FEES PAID TO EASY TRADELINES ON ACCOUNT OF THE CLIENT FOR WHOM SUCH CLAIMS ARISE OR RELATE.</strong></p>
      
      <h3>COMPLIANCE WITH LAW, POLICIES AND PROCEDURES; NO AGENCY</h3>
      <p><strong>7.1</strong> Reseller shall, at all times, strictly comply with all laws applicable to the Services.</p>
      <p><strong>7.2</strong> Reseller understands that it is not authorized by Easy Tradelines to act as its agent.</p>
      <p><strong>7.3</strong> Nothing in this Agreement is intended to create a partnership, joint venture, agency or franchise arrangement.</p>
      
      <h3>ELECTRONIC CONSENT</h3>
      <p><strong>8.1</strong> Reseller agrees to receive all information, copies of agreements and correspondence from Easy Tradelines in an electronic format.</p>
      
      <h3>NOTICE</h3>
      <p><strong>9.1</strong> For any notice, Easy Tradelines and Reseller agree that such notice shall be given to:</p>
      <p style="margin-left: 20px;"><strong>EASY TRADELINES:</strong><br/>
      Smart Latinos Consulting Group LLC<br/>
      777 NW 72ND AVE, STE 2008<br/>
      MIAMI, FL 33126</p>
      
      <h3>CONFIDENTIAL INFORMATION</h3>
      <p><strong>10.1</strong> Easy Tradelines agrees it will not sell, copy, release, or disclose any information of a Client.</p>
      <p><strong>10.2</strong> All information provided by Easy Tradelines to Reseller shall be deemed to be proprietary and confidential.</p>
      
      <h3>ARBITRATION/LITIGATION</h3>
      <p><strong>11.1</strong> In the event of any dispute, the parties shall use their best efforts to settle the dispute.</p>
      <p><strong>11.2</strong> If Reseller fails to pay for services rendered, Easy Tradelines shall be entitled to pursue collection proceedings.</p>
      
      <h3>GOVERNING LAW</h3>
      <p><strong>12.1</strong> This Agreement shall be interpreted and governed by the laws of the State of Florida.</p>
      <p><strong>12.2</strong> Jurisdiction and venue shall be in Los Angeles County, California.</p>
      
      <h3>13. GENERAL PROVISIONS</h3>
      <p><strong>13.1</strong> This Agreement comprises the entire agreement between the parties.</p>
      <p><strong>13.2</strong> Reseller may not assign this Agreement without prior written consent.</p>
      <p><strong>13.3</strong> If any term shall be held invalid, it shall not defeat the remaining provisions.</p>
      <p><strong>13.4</strong> Force Majeure provisions apply to unforeseen circumstances.</p>
      <p><strong>13.5</strong> This Agreement may only be modified in writing signed by both parties.</p>
      <p><strong>13.6</strong> Easy Tradelines may terminate this Agreement at any time for any reason.</p>
      
      <div style="margin-top: 50px; page-break-before: always;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 30px; text-align: center;">SIGNATURES</h3>
        
        <div style="margin-bottom: 40px;">
          <p><strong>RESELLER:</strong></p>
          <p>(Printed Name) ${isBlank ? '_______________________________' : brokerName || `${brokerData.first_name} ${brokerData.last_name}`}</p>
          <p>By: ${isBlank ? '_______________________________' : ''} &nbsp;&nbsp;&nbsp;&nbsp; Date: ${isBlank ? '_______________________________' : getCurrentDate()}</p>
          ${!isBlank && signatureData ? `<img src="${signatureData}" style="max-width: 200px; height: 60px;">` : '<div style="border-bottom: 1px solid #000; width: 200px; height: 40px; margin: 10px 0;"></div>'}
          <p>Its: ${isBlank ? '_______________________________' : brokerData.company_name}</p>
          <p>Initial: ${isBlank ? '________' : brokerInitials}</p>
        </div>
        
        <div style="margin-top: 40px;">
          <p><strong>EASY TRADELINES:</strong></p>
          <p>By: ${isBlank ? '_______________________________' : adminName} &nbsp;&nbsp;&nbsp;&nbsp; Date: ${isBlank ? '_______________________________' : getCurrentDate()}</p>
          ${!isBlank && adminSignature ? `<img src="${adminSignature}" style="max-width: 200px; height: 60px;">` : '<div style="border-bottom: 1px solid #000; width: 200px; height: 40px; margin: 10px 0;"></div>'}
          <p>Initial: ${isBlank ? '________' : adminInitials}</p>
        </div>
      </div>
      
      <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #666;">
        <p><strong>SMART LATINOS CONSULTING GROUP, LLC</strong></p>
        <p>777 NW 72ND AVE, STE 2008 MIAMI, FL 33126</p>
        <p>info@easytradelines.com</p>
      </div>
    </div>
  `;
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
      maxWidth: '1000px',
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
      gap: '12px',
      alignItems: 'center'
    },
    downloadButton: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      fontWeight: '500'
    },
    blankButton: {
      padding: '8px 16px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      fontWeight: '500'
    },
    editButton: {
      padding: '6px 12px',
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '8px'
    },
    closeButton: {
      padding: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      borderRadius: '6px',
      color: '#6b7280'
    },
    content: {
      padding: '32px',
      maxHeight: 'calc(95vh - 200px)',
      overflowY: 'auto',
      fontSize: '13px',
      lineHeight: '1.6',
      color: '#374151'
    },
    contractTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#1f2937',
      marginBottom: '24px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    contractDate: {
      textAlign: 'center',
      marginBottom: '32px',
      fontSize: '14px',
      color: '#6b7280',
      padding: '16px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '12px',
      textTransform: 'uppercase',
      borderBottom: '2px solid #2E7D32',
      paddingBottom: '4px'
    },
    paragraph: {
      marginBottom: '12px',
      textAlign: 'justify'
    },
    clause: {
      marginBottom: '10px',
      paddingLeft: '20px'
    },
    signatureSection: {
      marginTop: '32px',
      padding: '24px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '2px solid #e5e7eb'
    },
    signatureTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px',
      textAlign: 'center'
    },
    signatureRow: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px'
    },
    signatureCol: {
      flex: 1
    },
    signatureSubtitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '12px',
      textAlign: 'center'
    },
    signatureCanvas: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      cursor: 'crosshair',
      backgroundColor: 'white',
      display: 'block',
      margin: '0 auto',
      marginBottom: '12px'
    },
    signatureButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '12px'
    },
    button: {
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none'
    },
    clearButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    signButton: {
      backgroundColor: '#16a34a',
      color: 'white'
    },
    signedIndicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#16a34a',
      fontWeight: '600',
      fontSize: '12px'
    },
    brokerInputs: {
      marginTop: '12px'
    },
    adminInputs: {
      marginTop: '12px'
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      marginBottom: '8px',
      fontSize: '12px'
    },
    footer: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center'
    },
    footerText: {
      fontSize: '12px',
      color: '#6b7280',
      lineHeight: '1.4'
    },
    footerCompany: {
      fontWeight: '600',
      color: '#1f2937'
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
                <div style={styles.title}>Reseller Agreement</div>
              </div>
            </div>
          </div>
          <div style={styles.headerButtons}>
  {/* Indicador de bloqueo */}
  {isLocked && (
    <div style={{
      padding: '4px 8px',
      backgroundColor: '#fef2f2',
      border: '1px solid #ef4444',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#991b1b',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      🔒 LOCKED
    </div>
  )}
  
  {/* Botón de Lock/Unlock para admin */}
  {isAdmin && (
    <button 
      onClick={handleLockToggle}
      style={{
        padding: '8px 12px',
        border: 'none',
        backgroundColor: isLocked ? '#dc2626' : '#eab308',
        color: 'white',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {isLocked ? '🔓 Unlock' : '🔒 Lock'}
    </button>
  )}
  
  <button 
    onClick={downloadBlankPDF}
              style={styles.blankButton}
            >
              <FileText size={16} />
              Download Blank
            </button>
            <button 
              onClick={downloadSignedPDF}
              style={styles.downloadButton}
              disabled={!isSigned}
            >
              <Download size={16} />
              Download Signed
            </button>
            <button onClick={onClose} style={styles.closeButton}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <h1 style={styles.contractTitle}>Easy Tradelines Reseller Agreement</h1>
          
          <div style={styles.contractDate}>
            This Agreement is entered into on <strong>{getCurrentDate()}</strong>, by and between <strong>SMART LATINOS CONSULTING GROUP LLC</strong>, doing business as Easy Tradelines, hereinafter referred to as "Easy Tradelines", and <strong>{brokerData.first_name} {brokerData.last_name}</strong> whose address is <strong>{brokerData.company_name}</strong>, hereinafter called "Reseller".
          </div>

          {/* TODAS LAS 13 SECCIONES DEL CONTRATO */}
          
          {/* Section 1: PURPOSE OF THE AGREEMENT */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>PURPOSE OF THE AGREEMENT</h2>
            <div style={styles.paragraph}>
              <strong>1.1</strong> Easy Tradelines and Reseller have entered into this Agreement to set forth the terms and conditions under which Easy Tradelines will enable the Reseller to access Easy Tradelines portfolio of third party trade-lines for the sole purpose of attempting to increase the FICO score of Reseller's customers (the Clients).
            </div>
            <div style={styles.paragraph}>
              <strong>1.2</strong> Reseller hereby agrees to be bound to the following terms and conditions regarding all services rendered by Easy Tradelines under this Agreement.
            </div>
          </div>

          {/* Section 2: SERVICES */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>SERVICES</h2>
            <div style={styles.paragraph}>
              <strong>2.1</strong> Easy Tradelines will perform the following services for the benefit of the Reseller:
            </div>
            <div style={styles.clause}>
              <strong>a)</strong> Easy Tradeline will make available to Reseller certain credit facilities of third party investors who have agreed to permit Clients to be added as an authorized user to one or more of the Investor's credit facilities (the "Services"). In making the Services available to the Clients, Reseller shall comply with all terms and conditions of the Services established, as may be modified from time to time, by Easy Tradelines, including without limitation, a service manual provided to Reseller by Easy Tradelines (the "Service Manual").
            </div>
          </div>

          {/* Section 3: COVENANTS, REPRESENTATIONS, AND WARRANTIES */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>COVENANTS, REPRESENTATIONS, AND WARRANTIES</h2>
            <div style={styles.paragraph}>
              <strong>3.1</strong> Reseller's Covenants, Representations, and Warranties. Reseller covenants, represents and warrants the following:
            </div>
            <div style={styles.clause}>
              <strong>a)</strong> All information provided by Reseller to Easy Tradelines in connection with this Agreement and the Services is correct, complete and accurate in all respects.
            </div>
            <div style={styles.clause}>
              <strong>b)</strong> Reseller will comply with all terms and conditions of the Services, as established and modified by Easy Tradelines from time to time.
            </div>
            <div style={styles.clause}>
              <strong>c)</strong> Reseller has received and reviewed a copy of the current Service Manual prior to entering this Agreement, and will review and comply with any modifications of the Service Manual that Easy Tradelines may issue in the future.
            </div>
            <div style={styles.clause}>
              <strong>d)</strong> Reseller will not contact, or make any attempt to contact, any of our Investors, or any co-borrower, lender or other grantor of credit, in connection with a credit facility made available through the Services at any time or for any reason.
            </div>
            <div style={styles.clause}>
              <strong>e)</strong> Reseller acknowledges and agrees that Easy Tradelines makes no representation or guarantee that the Services will result in any improvement of a Client's credit score.
            </div>
            <div style={styles.clause}>
              <strong>f)</strong> Reseller will promptly notify Easy Tradelines of any material change to Client's name or contact information.
            </div>
            <div style={styles.clause}>
              <strong>g)</strong> Reseller will not make any representation to any Client that it is acting for or on behalf of Easy Tradelines.
            </div>
            <div style={styles.clause}>
              <strong>h)</strong> Reseller shall undertake a commercially reasonable review of its Clients' application for services, including verification of identity and creditworthiness.
            </div>
            
            <div style={styles.paragraph}>
              <strong>3.2</strong> Easy Tradelines Covenants, Representations, and Warranties:
            </div>
            <div style={styles.clause}>
              <strong>a)</strong> Easy Tradelines does not and cannot guarantee any result or improvement in credit score.
            </div>
            <div style={styles.clause}>
              <strong>b)</strong> Easy Tradelines does not and cannot guarantee that any Client will be approved for any loan or credit request.
            </div>
            <div style={styles.clause}>
              <strong>c)</strong> Easy Tradelines is not a credit repair company.
            </div>
          </div>

          {/* Section 4: COMPENSATION */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>COMPENSATION</h2>
            <div style={styles.paragraph}>
              <strong>4.1</strong> In exchange for Easy Tradelines Services under this Agreement, the Reseller agrees to pay to Easy Tradelines a fee equal to the amount shown on the schedule of available credit facilities.
            </div>
            <div style={styles.paragraph}>
              <strong>4.2</strong> No fee for Services is earned by Easy Tradelines or the Investor until and unless the Services are deemed completed.
            </div>
          </div>

          {/* Section 5: TIME FOR PERFORMANCE OF SERVICES */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>TIME FOR PERFORMANCE OF SERVICES</h2>
            <div style={styles.paragraph}>
              <strong>5.1</strong> Following execution of this Agreement by the parties, Easy Tradelines will provide Reseller with a schedule of available credit facilities.
            </div>
            <div style={styles.paragraph}>
              <strong>5.2</strong> Reseller acknowledges and agrees that Easy Tradelines is not involved in any manner whatsoever in the determination or assessment of a FICO score.
            </div>
          </div>

          {/* Section 6: LIMITATION OF LIABILITY */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>LIMITATION OF LIABILITY</h2>
            <div style={styles.paragraph}>
              <strong>6.1 THE TOTAL LIABILITY OF EASY TRADELINES SHALL NOT EXCEED THE TOTAL AMOUNT OF FEES PAID TO EASY TRADELINES ON ACCOUNT OF THE CLIENT FOR WHOM SUCH CLAIMS ARISE OR RELATE.</strong>
            </div>
          </div>

          {/* Section 7: COMPLIANCE WITH LAW */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>COMPLIANCE WITH LAW, POLICIES AND PROCEDURES; NO AGENCY</h2>
            <div style={styles.paragraph}>
              <strong>7.1</strong> Reseller shall, at all times, strictly comply with all laws applicable to the Services.
            </div>
            <div style={styles.paragraph}>
              <strong>7.2</strong> Reseller understands that it is not authorized by Easy Tradelines to act as its agent.
            </div>
            <div style={styles.paragraph}>
              <strong>7.3</strong> Nothing in this Agreement is intended to create a partnership, joint venture, agency or franchise arrangement.
            </div>
          </div>

          {/* Section 8: ELECTRONIC CONSENT */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>ELECTRONIC CONSENT</h2>
            <div style={styles.paragraph}>
              <strong>8.1</strong> Reseller agrees to receive all information, copies of agreements and correspondence from Easy Tradelines in an electronic format.
            </div>
          </div>

          {/* Section 9: NOTICE */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>NOTICE</h2>
            <div style={styles.paragraph}>
              <strong>9.1</strong> For any notice, Easy Tradelines and Reseller agree that such notice shall be given to:
            </div>
            <div style={styles.paragraph}>
              <strong>EASY TRADELINES:</strong><br />
              Smart Latinos Consulting Group LLC<br />
              777 NW 72ND AVE, STE 2008<br />
              MIAMI, FL 33126
            </div>
          </div>

          {/* Section 10: CONFIDENTIAL INFORMATION */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>CONFIDENTIAL INFORMATION</h2>
            <div style={styles.paragraph}>
              <strong>10.1</strong> Easy Tradelines agrees it will not sell, copy, release, or disclose any information of a Client.
            </div>
            <div style={styles.paragraph}>
              <strong>10.2</strong> All information provided by Easy Tradelines to Reseller shall be deemed to be proprietary and confidential.
            </div>
          </div>

          {/* Section 11: ARBITRATION/LITIGATION */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>ARBITRATION/LITIGATION</h2>
            <div style={styles.paragraph}>
              <strong>11.1</strong> In the event of any dispute, the parties shall use their best efforts to settle the dispute.
            </div>
            <div style={styles.paragraph}>
              <strong>11.2</strong> If Reseller fails to pay for services rendered, Easy Tradelines shall be entitled to pursue collection proceedings.
            </div>
          </div>

          {/* Section 12: GOVERNING LAW */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>GOVERNING LAW</h2>
            <div style={styles.paragraph}>
              <strong>12.1</strong> This Agreement shall be interpreted and governed by the laws of the State of Florida.
            </div>
            <div style={styles.paragraph}>
              <strong>12.2</strong> Jurisdiction and venue shall be in Los Angeles County, California.
            </div>
          </div>

          {/* Section 13: GENERAL PROVISIONS */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>13. GENERAL PROVISIONS</h2>
            <div style={styles.paragraph}>
              <strong>13.1</strong> This Agreement comprises the entire agreement between the parties.
            </div>
            <div style={styles.paragraph}>
              <strong>13.2</strong> Reseller may not assign this Agreement without prior written consent.
            </div>
            <div style={styles.paragraph}>
              <strong>13.3</strong> If any term shall be held invalid, it shall not defeat the remaining provisions.
            </div>
            <div style={styles.paragraph}>
              <strong>13.4</strong> Force Majeure provisions apply to unforeseen circumstances.
            </div>
            <div style={styles.paragraph}>
              <strong>13.5</strong> This Agreement may only be modified in writing signed by both parties.
            </div>
            <div style={styles.paragraph}>
              <strong>13.6</strong> Easy Tradelines may terminate this Agreement at any time for any reason.
            </div>
          </div>

          {/* Digital Signature Section */}
          <div style={styles.signatureSection}>
            <h3 style={styles.signatureTitle}>Digital Signatures Required</h3>
            
            <div style={styles.signatureRow}>
              {/* Reseller Signature */}
              <div style={styles.signatureCol}>
                <h4 style={styles.signatureSubtitle}>RESELLER SIGNATURE</h4>
                {!isSigned ? (
                  <>
                    <div style={styles.brokerInputs}>
                      <input
                        type="text"
                        placeholder="Broker Full Name"
                        value={brokerName}
                        disabled={isLocked}
                        onChange={(e) => !isLocked && setBrokerName(e.target.value)}
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Broker Initials"
                        value={brokerInitials}
                        onChange={(e) => !isLocked && setBrokerInitials(e.target.value)}
                        style={styles.input}
                        maxLength={4}
                      />
                    </div>
                    <p style={{textAlign: 'center', marginBottom: '12px', color: '#6b7280', fontSize: '12px'}}>
                      Please sign below using your mouse or touch device
                    </p>
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={120}
                      style={styles.signatureCanvas}
                      onMouseDown={(e) => !isLocked && startDrawing(e)}
                      onMouseMove={(e) => !isLocked && draw(e)}
                      onMouseUp={() => !isLocked && stopDrawing()}
                      onMouseLeave={() => !isLocked && stopDrawing()}
                    />
                    <div style={styles.signatureButtons}>
                      <button
                        onClick={clearSignature}
                        disabled={isLocked}
                        style={{...styles.button, ...styles.clearButton}}
                      >
                        Clear
                      </button>
                      <button
                        onClick={completeSignature}
                        style={{...styles.button, ...styles.signButton}}
                      >
                        <PenTool size={14} style={{marginRight: '4px'}} />
                        Complete
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.signedIndicator}>
                      <Check size={16} />
                      Signed by {brokerName}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={editBrokerSignature}
                        style={styles.editButton}
                      >
                        <Edit2 size={14} />
                        Edit Signature
                      </button>
                    )}
                  </>
                )}
                
                <div style={{marginTop: '12px', fontSize: '11px', color: '#6b7280', textAlign: 'center'}}>
                  <p><strong>Printed Name:</strong> {brokerName || brokerData.first_name + ' ' + brokerData.last_name}</p>
                  <p><strong>Company:</strong> {brokerData.company_name}</p>
                  <p><strong>Date:</strong> {getCurrentDate()}</p>
                  <p><strong>Initial:</strong> {brokerInitials || '____'} I have understood the document.</p>
                </div>
              </div>

              {/* Admin Signature */}
              {isAdmin && (
                <div style={styles.signatureCol}>
                  <h4 style={styles.signatureSubtitle}>EASY TRADELINES (Admin)</h4>
                  {!adminSignature ? (
                    <>
                      <div style={styles.adminInputs}>
                        <input
                          type="text"
                          placeholder="Admin Name"
                          value={adminName}
                          onChange={(e) => !isLocked && setAdminName(e.target.value)}
                          style={styles.input}
                        />
                        <input
                          type="text"
                          placeholder="Admin Initials"
                          value={adminInitials}
                          onChange={(e) => !isLocked && setAdminInitials(e.target.value)}
                          style={styles.input}
                          maxLength={4}
                        />
                      </div>
                      <p style={{textAlign: 'center', marginBottom: '12px', color: '#6b7280', fontSize: '12px'}}>
                        Please sign below
                      </p>
                      <canvas
                        ref={adminCanvasRef}
                        width={300}
                        height={120}
                        style={styles.signatureCanvas}
                        onMouseDown={(e) => !isLocked && startAdminDrawing(e)}
                        onMouseMove={(e) => !isLocked && drawAdmin(e)}
                        onMouseUp={() => !isLocked && stopAdminDrawing()}
                        onMouseLeave={() => !isLocked && stopAdminDrawing()}
                      />
                      <div style={styles.signatureButtons}>
                        <button
                          onClick={clearAdminSignature}
                          style={{...styles.button, ...styles.clearButton}}
                        >
                          Clear
                        </button>
                        <button
                          onClick={completeAdminSignature}
                          style={{...styles.button, ...styles.signButton}}
                        >
                          <PenTool size={14} style={{marginRight: '4px'}} />
                          Complete
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.signedIndicator}>
                        <Check size={16} />
                        Signed by {adminName}
                      </div>
                      <button
                        onClick={editAdminSignature}
                        style={styles.editButton}
                      >
                        <Edit2 size={14} />
                        Edit Signature
                      </button>
                    </>
                  )}
                  
                  <div style={{marginTop: '12px', fontSize: '11px', color: '#6b7280', textAlign: 'center'}}>
                    <p><strong>Easy Tradelines (Smart Latinos Consulting Group, DBA)</strong></p>
                    <p><strong>By:</strong> {adminName || '_______________'}</p>
                    <p><strong>Date:</strong> {getCurrentDate()}</p>
                    <p><strong>Initial:</strong> {adminInitials || '____'} I have understood the document.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.footerText}>
            <div style={styles.footerCompany}>SMART LATINOS CONSULTING GROUP, LLC</div>
            <div>777 NW 72ND AVE, STE 2008 MIAMI, FL 33126</div>
            <div>info@easytradelines.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSignaturePopup;
