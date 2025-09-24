import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, FileText, Check, Download } from 'lucide-react';

const ContractSignaturePopup = ({ isOpen, onClose, brokerData, onSignComplete, currentUser }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [adminSignature, setAdminSignature] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [adminInitials, setAdminInitials] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerInitials, setBrokerInitials] = useState('');
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
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">PURPOSE OF THE AGREEMENT</h2>
        <p><strong>1.1</strong> Easy Tradelines and Reseller have entered into this Agreement to set forth the terms and conditions under which Easy Tradelines will enable the Reseller to access Easy Tradelines portfolio of third party trade-lines for the sole purpose of attempting to increase the FICO score of Reseller's customers (the Clients).</p>
        <p><strong>1.2</strong> Reseller hereby agrees to be bound to the following terms and conditions regarding all services rendered by Easy Tradelines under this Agreement.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">SERVICES</h2>
        <p><strong>2.1</strong> Easy Tradelines will perform the following services for the benefit of the Reseller:</p>
        <p style="margin-left: 20px;"><strong>a)</strong> Easy Tradeline will make available to Reseller certain credit facilities of third party investors who have agreed to permit Clients to be added as an authorized user to one or more of the Investor's credit facilities (the "Services"). In making the Services available to the Clients, Reseller shall comply with all terms and conditions of the Services established, as may be modified from time to time, by Easy Tradelines, including without limitation, a service manual provided to Reseller by Easy Tradelines (the "Service Manual").</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">COVENANTS, REPRESENTATIONS, AND WARRANTIES</h2>
        <p><strong>3.1</strong> Reseller's Covenants, Representations, and Warranties. Reseller covenants, represents and warrants the following:</p>
        <p style="margin-left: 20px;"><strong>a)</strong> All information provided by Reseller to Easy Tradelines in connection with this Agreement and the Services is correct, complete and accurate in all respects.</p>
        <p style="margin-left: 20px;"><strong>b)</strong> Reseller will comply with all terms and conditions of the Services, as established and modified by Easy Tradelines from time to time.</p>
        <p style="margin-left: 20px;"><strong>c)</strong> Reseller has received and reviewed a copy of the current Service Manual prior to entering this Agreement, and will review and comply with any modifications of the Service Manual that Easy Tradelines may issue in the future.</p>
        <p style="margin-left: 20px;"><strong>d)</strong> Reseller will not contact, or make any attempt to contact, any of our Investors, or any co-borrower, lender or other grantor of credit, in connection with a credit facility made available through the Services at any time or for any reason. Reseller agrees that any contact by Reseller or a Client of a Easy Tradelines Investor, or any co-borrower, lender or other grantor of credit, in connection with a credit facility made available through the Services may result in the immediate termination of this Agreement, or of the Client's access to a credit facility made available through the Services, without notice or refund of any fees paid to Easy Tradelines by Reseller on account of this Agreement or by the Client on account of the credit facility made available through the Services.</p>
        <p style="margin-left: 20px;"><strong>e)</strong> Reseller acknowledges and agrees that Easy Tradelines makes no representation or guarantee that the Services will result in any improvement of a Client's credit score associated with the Easy Tradelines Investor's trade-line for any purpose related to this Agreement. Reseller acknowledges and agrees that the addition of a Client as an authorized user to a credit facility made available through the Services is made for the sole and exclusive purpose of attempting to enhance the Client's FICO credit score and that Client is not authorized, by Easy Tradelines, the Investor, or the Reseller, to utilize any of the credit available under that credit facility for any other purpose at any time.</p>
        <p style="margin-left: 20px;"><strong>f)</strong> Reseller will promptly notify Easy Tradelines of any material change to Client's name or contact information, including, but not limited to, telephone numbers, mailing addresses, and email addresses.</p>
        <p style="margin-left: 20px;"><strong>g)</strong> Reseller will not make any representation to any Client that it is acting for or on behalf of Easy Tradelines with respect to the Services, and Reseller will immediately take all necessary and appropriate action to eliminate any understanding or impression of a Client that Reseller is acting as an agent for Easy Tradelines as to the Services.</p>
        <p style="margin-left: 20px;"><strong>h)</strong> Reseller shall undertake a commercially reasonable review of its Clients' application for services, including without limitation, the use of Know-Your-Customer policies and procedures employed by financial institutions with respect to United States-based transactions, to verify the identity of such Client and the nature of such Client's credit and business activities. Reseller hereby represents and warrants with respect to each such Client referred to Easy Tradelines for services under this Agreement that: (i) it has independently verified the identity of every Client referred to Easy Tradelines for service under this Agreement; (ii) each Client referred by Reseller is the individual for whom the Social Security number provided to Easy Tradelines was issued to by the Social Security Administration; and (iii) a reasonable background check of each Client performed by Reseller has not revealed any red flags as to Client's creditworthiness.</p>
        
        <p><strong>3.2</strong> Easy Tradelines Covenants, Representations, and Warranties. Easy Tradelines covenants, represents and warrants the following:</p>
        <p style="margin-left: 20px;"><strong>a)</strong> Easy Tradelines does not and cannot guarantee any result or improvement in credit score as result of a Client's use of its Services.</p>
        <p style="margin-left: 20px;"><strong>b)</strong> Easy Tradelines does not and cannot guarantee that any Client will be approved for any loan or credit request as a result of its Services.</p>
        <p style="margin-left: 20px;"><strong>c)</strong> Easy Tradelines is not a credit repair company in that it does not attempt to correct inaccurate information on any credit report of a Client, does not submit or attempt to resolve credit disputes on behalf of the Client, and does not attempt to improve a Client's credit record or history.</p>
        
        <!-- Continuación de todas las secciones 4-13 como las tienes en tu archivo actual -->
        <!-- ... aquí va todo el resto del HTML del contrato ... -->
        
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

          <div style={styles.signatureSection}>
            <h3 style={styles.signatureTitle}>Digital Signatures Required</h3>
            
            <div style={styles.signatureRow}>
              <div style={styles.signatureCol}>
                <h4 style={styles.signatureSubtitle}>RESELLER SIGNATURE</h4>
                {!isSigned ? (
                  <>
                    <div style={styles.brokerInputs}>
                      <input
                        type="text"
                        placeholder="Broker Full Name"
                        value={brokerName}
                        onChange={(e) => setBrokerName(e.target.value)}
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Broker Initials"
                        value={brokerInitials}
                        onChange={(e) => setBrokerInitials(e.target.value)}
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
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div style={styles.signatureButtons}>
                      <button
                        onClick={clearSignature}
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
                  <div style={styles.signedIndicator}>
                    <Check size={16} />
                    Signed by {brokerName}
                  </div>
                )}
                
                <div style={{marginTop: '12px', fontSize: '11px', color: '#6b7280', textAlign: 'center'}}>
                  <p><strong>Printed Name:</strong> {brokerName || brokerData.first_name + ' ' + brokerData.last_name}</p>
                  <p><strong>Company:</strong> {brokerData.company_name}</p>
                  <p><strong>Date:</strong> {getCurrentDate()}</p>
                  <p><strong>Initial:</strong> {brokerInitials || '____'} I have understood the document.</p>
                </div>
              </div>

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
                          onChange={(e) => setAdminName(e.target.value)}
                          style={styles.input}
                        />
                        <input
                          type="text"
                          placeholder="Admin Initials"
                          value={adminInitials}
                          onChange={(e) => setAdminInitials(e.target.value)}
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
                        onMouseDown={startAdminDrawing}
                        onMouseMove={drawAdmin}
                        onMouseUp={stopAdminDrawing}
                        onMouseLeave={stopAdminDrawing}
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
                    <div style={styles.signedIndicator}>
                      <Check size={16} />
                      Signed by {adminName}
                    </div>
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
