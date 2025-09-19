import React, { useState, useRef } from 'react';
import { X, PenTool, FileText, Check } from 'lucide-react';

const ContractSignaturePopup = ({ isOpen, onClose, brokerData, onSignComplete }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Obtener fecha actual
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Inicializar canvas para firma
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  // Eventos de dibujo para firma
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

  // Limpiar firma
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
    setSignatureData(null);
  };

  // Completar firma
  const completeSignature = () => {
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas.toDataURL();
    setSignatureData(signatureDataUrl);
    setIsSigned(true);
    
    // Enviar datos completos al componente padre
    onSignComplete({
      signatureImage: signatureDataUrl,
      contractData: {
        reseller_name: `${brokerData.first_name} ${brokerData.last_name}`,
        reseller_address: brokerData.company_name,
        reseller_phone: brokerData.phone,
        reseller_email: brokerData.email,
        signature_date: getCurrentDate()
      }
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
      maxWidth: '900px',
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
      fontSize: '14px',
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
      fontSize: '16px',
      color: '#6b7280'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '12px',
      textTransform: 'uppercase'
    },
    paragraph: {
      marginBottom: '16px',
      textAlign: 'justify'
    },
    clause: {
      marginBottom: '12px',
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
    signatureCanvas: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      cursor: 'crosshair',
      backgroundColor: 'white',
      display: 'block',
      margin: '0 auto',
      marginBottom: '16px'
    },
    signatureButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
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
      fontWeight: '600'
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
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
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

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Covenants, Representations, and Warranties</h2>
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
              <strong>g)</strong> Reseller will not make any representation to any Client that it is acting for or on behalf of Easy Tradelines with respect to the Services.
            </div>
            <div style={styles.clause}>
              <strong>h)</strong> Reseller shall undertake a commercially reasonable review of its Clients' application for services, including the use of Know-Your-Customer policies and procedures to verify the identity of such Client.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Compensation</h2>
            <div style={styles.paragraph}>
              <strong>4.1</strong> In exchange for Easy Tradelines Services under this Agreement, the Reseller agrees to pay to Easy Tradelines a fee equal to the amount shown on the schedule of available credit facilities for the credit facility selected by the Reseller.
            </div>
            <div style={styles.paragraph}>
              <strong>4.2</strong> No fee for Services is earned by Easy Tradelines until the Services are deemed completed when the addition of the Client as an authorized user of the Investor's credit facility is confirmed.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Limitation of Liability</h2>
            <div style={styles.paragraph}>
              <strong>6.1</strong> THE TOTAL LIABILITY OF EASY TRADELINES, TOGETHER WITH ANY OF ITS EMPLOYEES, AGENTS, OFFICERS, DIRECTORS, SHAREHOLDERS AND AFFILIATES, FOR DAMAGES ON ACCOUNT OF CLAIMS ARISING FROM OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT OF FEES PAID TO EASY TRADELINES.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Electronic Consent</h2>
            <div style={styles.paragraph}>
              <strong>8.1</strong> Reseller agrees to receive all information, copies of agreements and correspondence from Easy Tradelines in electronic format. All electronic communications will be deemed valid and authentic with the same legal effect as written and signed paper communications.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Governing Law</h2>
            <div style={styles.paragraph}>
              <strong>12.1</strong> This Agreement shall be interpreted and governed by the laws of the State of Florida.
            </div>
          </div>

          {/* Signature Section */}
          <div style={styles.signatureSection}>
            <h3 style={styles.signatureTitle}>Digital Signature Required</h3>
            
            {!isSigned ? (
              <>
                <p style={{textAlign: 'center', marginBottom: '16px', color: '#6b7280'}}>
                  Please sign below using your mouse or touch device
                </p>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  style={styles.signatureCanvas}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onLoad={initCanvas}
                />
                <div style={styles.signatureButtons}>
                  <button
                    onClick={clearSignature}
                    style={{...styles.button, ...styles.clearButton}}
                  >
                    Clear Signature
                  </button>
                  <button
                    onClick={completeSignature}
                    style={{...styles.button, ...styles.signButton}}
                  >
                    <PenTool size={16} style={{marginRight: '4px'}} />
                    Complete Signature
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.signedIndicator}>
                <Check size={20} />
                Contract signed successfully by {brokerData.first_name} {brokerData.last_name}
              </div>
            )}

            <div style={{marginTop: '16px', fontSize: '12px', color: '#6b7280', textAlign: 'center'}}>
              <p><strong>RESELLER:</strong></p>
              <p>{brokerData.first_name} {brokerData.last_name}</p>
              <p>{brokerData.company_name}</p>
              <p>{brokerData.email}</p>
              <p><strong>Date:</strong> {getCurrentDate()}</p>
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
