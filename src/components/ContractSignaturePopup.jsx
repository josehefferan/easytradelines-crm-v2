import React, { useState, useRef } from 'react';
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

  // Verificar si el usuario actual es admin
  const isAdmin = currentUser?.role === 'admin';

  // Obtener fecha actual
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Inicializar canvas para firma
  const initCanvas = (canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  // Eventos de dibujo para firma del broker
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

  // Eventos de dibujo para firma del admin
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

  // Limpiar firmas
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

  // Completar firma del broker
  const completeSignature = () => {
    if (!brokerName.trim() || !brokerInitials.trim()) {
      alert('Por favor complete el nombre e iniciales del broker');
      return;
    }
    
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas.toDataURL();
    setSignatureData(signatureDataUrl);
    setIsSigned(true);
    
    // Enviar datos completos al componente padre
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
  };

  // Completar firma del admin
  const completeAdminSignature = () => {
    if (!adminName.trim() || !adminInitials.trim()) {
      alert('Por favor complete el nombre e iniciales del admin');
      return;
    }
    
    const canvas = adminCanvasRef.current;
    const adminSignatureDataUrl = canvas.toDataURL();
    setAdminSignature(adminSignatureDataUrl);
  };

  // Generar y descargar PDF
  const downloadPDF = () => {
    window.print();
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
              onClick={downloadPDF}
              style={styles.downloadButton}
              disabled={!isSigned}
            >
              <Download size={16} />
              Print/Save PDF
            </button>
            <button onClick={onClose} style={styles.closeButton}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <h1 style={styles.contractTitle}>Easy Tradelines Reseller Agreement</h1>
          
          <div style={styles.contractDate}>
            This Agreement is entered into on <strong>{getCurrentDate()}</strong>, by and between <strong>SMART LATINOS CONSULTING GROUP LLC</strong>, doing business as Easy Tradelines, hereinafter referred to as "Easy Tradelines", and <strong>{brokerData.first_name} {brokerData.last_name}</strong> whose company is <strong>{brokerData.company_name}</strong>, hereinafter called "Reseller".
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Purpose of the Agreement</h2>
            <div style={styles.paragraph}>
              <strong>1.1</strong> Easy Tradelines and Reseller have entered into this Agreement to set forth the terms and conditions under which Easy Tradelines will enable the Reseller to access Easy Tradelines portfolio of third party trade-lines for the sole purpose of attempting to increase the FICO score of Reseller's customers (the Clients).
            </div>
            <div style={styles.paragraph}>
              <strong>1.2</strong> Reseller hereby agrees to be bound to the following terms and conditions regarding all services rendered by Easy Tradelines under this Agreement.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Services</h2>
            <div style={styles.paragraph}>
              <strong>2.1</strong> Easy Tradelines will perform the following services for the benefit of the Reseller:
            </div>
            <div style={styles.clause}>
              <strong>a)</strong> Easy Tradeline will make available to Reseller certain credit facilities of third party investors who have agreed to permit Clients to be added as an authorized user to one or more of the Investor's credit facilities (the "Services"). In making the Services available to the Clients, Reseller shall comply with all terms and conditions of the Services established, as may be modified from time to time, by Easy Tradelines, including without limitation, a service manual provided to Reseller by Easy Tradelines (the "Service Manual").
            </div>
          </div>

          {/* Resto del contenido del contrato - omitido por brevedad */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>General Provisions</h2>
            <div style={styles.paragraph}>
              <strong>13.6</strong> Notwithstanding any provision herein to the contrary, Easy Tradelines may terminate this Agreement, and the Reseller's right to provide services made available to it under this Agreement, at any time for any reason for no reason and without prior notice to the Reseller.
            </div>
          </div>

          {/* Signature Section */}
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
                      onLoad={() => initCanvas(canvasRef)}
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
                        onLoad={() => initCanvas(adminCanvasRef)}
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
