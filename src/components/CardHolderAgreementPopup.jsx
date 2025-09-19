import React, { useState, useRef } from 'react';
import { X, PenTool, FileText, Check, Download } from 'lucide-react';

const CardHolderAgreementPopup = ({ isOpen, onClose, affiliateData, onSignComplete }) => {
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
        cardholder_name: `${affiliateData.first_name} ${affiliateData.last_name}`,
        cardholder_phone: affiliateData.phone,
        cardholder_email: affiliateData.email,
        signature_date: getCurrentDate()
      }
    });
  };

  // Descargar PDF del contrato
  const downloadContract = () => {
    // Aquí implementarías la generación del PDF
    // Por ahora, solo mostramos un alert
    alert('PDF generation would be implemented here with libraries like jsPDF or react-pdf');
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
                <div style={styles.title}>Card Holder Agreement</div>
              </div>
            </div>
          </div>
          <div style={styles.headerButtons}>
            <button 
              onClick={downloadContract}
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
          <h1 style={styles.contractTitle}>Card Holder Agreement</h1>
          
          <div style={styles.contractDate}>
            This Agreement is entered into on <strong>{getCurrentDate()}</strong>, by and between <strong>Smart Latinos Consulting Group</strong>, doing business as Easy Tradelines, hereinafter referred to as "Easy Tradelines", and <strong>{affiliateData.first_name} {affiliateData.last_name}</strong>, hereinafter called "Card Holder".
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Purpose of the Agreement</h2>
            <div style={styles.paragraph}>
              Easy Tradelines and Card Holder have entered into this Agreement to set forth the terms and conditions under which Easy Tradelines will facilitate a third-party's (the "Third-Party") temporary designation on the Card Holder's credit lines/trade-lines as an authorized user for the sole purpose of attempting to increase the Third-Party's FICO score.
            </div>
            <div style={styles.paragraph}>
              Cardholder hereby agrees to be bound to the following terms and conditions regarding all services rendered by Easy Tradelines.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Services</h2>
            <div style={styles.paragraph}>
              Easy Tradelines will perform the following services under this Agreement.
            </div>
            <div style={styles.paragraph}>
              Easy Tradelines will use its best efforts to establish relationships between Cardholder and Third-Parties based on its review of the creditworthiness of the Cardholder and the credit enhancement sought by Third-Parties. The decision of Easy Tradelines to match any Third-Party with the Cardholder shall be within the sole and exclusive discretion of Easy Tradelines, and Easy Tradelines makes no representation, actual or implied, that any Third-Party will be presented to Cardholder for its consideration to be added as an authorized user on any tradelines made available by the Cardholder pursuant to this Agreement.
            </div>
            <div style={styles.paragraph}>
              Easy Tradelines will make an independent review of the Cardholder's creditworthiness and available trade-lines for purposes of: (i) determining whether the addition of a Third-Party to these tradelines is likely to have a positive effect on the Third-Party's FICO score; (ii) assessing the value of the Cardholder's agreement to make a tradeline available to a Third-Party; and (iii) providing Cardholder with the appropriate information from a Third-Party so as to enable the Cardholder to add these third-parties as additional authorized users of such trade-lines.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Covenants, Representations, and Warranties</h2>
            <div style={styles.paragraph}>
              <strong>3.1</strong> Easy Tradeline Card Holders covenants, represents and warrants the following:
            </div>
            <div style={styles.clause}>
              Cardholder shall provide all information requested by Easy Tradelines and that all such information is true, complete and correct in all respects.
            </div>
            <div style={styles.clause}>
              Cardholder authorizes Easy Tradelines to obtain from Equifax, Experian, and TransUnion, or any their respective affiliates (together, the "Credit Bureaus"), and, if necessary, from their respective subscribers, all credit and transaction information regarding Cardholder's credit history, credit transactions of record, and credit scores.
            </div>
            <div style={styles.clause}>
              Cardholder represents, warrants and agrees that he/she shall not attempt to contact nor have any direct contact with any Third-Party. If Cardholder is contacted directly by any Third-Party, Cardholder shall not communicate with the Third-Party and shall immediately contact Easy Tradelines advising them of the contact.
            </div>
            <div style={styles.clause}>
              Cardholder acknowledges that all information provided to it by Easy Tradelines with respect to a Third-Party is confidential, and Cardholder agrees that it shall keep all such information confidential by taking appropriate measures to ensure against the unauthorized release or reproduction of or access to the information.
            </div>
            <div style={styles.clause}>
              Cardholder shall promptly notify Easy Tradelines of any material change in its name or contact information, including, but not limited to, any change in telephone numbers, mail addresses, or email addresses.
            </div>
            <div style={styles.clause}>
              Cardholder shall promptly notify Easy Tradelines of any material change to its tradelines, including, but not limited to, any changes in payment due dates, credit limits, or outstanding balances on these trade-lines.
            </div>
            <div style={styles.clause}>
              For so long as any Third-Party is an authorized user of any tradeline, Cardholder agrees that it will maintain an outstanding balance on the tradeline that is less than 10% of the maximum credit made available by the lender under such tradeline, and that it will make timely payment in accordance with the terms and conditions of the tradeline.
            </div>
            <div style={styles.clause}>
              Cardholder shall add a Third-Party as an authorized user to the applicable tradeline within 48 hours of receiving all information from Easy Tradelines. Unless a different time period is requested by Easy Tradelines, Cardholder agrees to keep Third-Party as an authorized user on its tradeline for a minimum of one-billing cycle or thirty (30) days.
            </div>
            <div style={styles.clause}>
              Cardholder shall not provide a Third-Party with the ability to access the trade-line in any manner, including, but not limited to, by providing a check, credit card, an account number, or any authorization code.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Compensation</h2>
            <div style={styles.paragraph}>
              In exchange for Cardholder's agreement to add a Third-Party as an authorized user of any trade-line, Cardholder shall receive a fee in an amount to be determined by Easy Tradelines. The fee paid by Easy Tradelines shall be determined by Easy Tradelines in its sole discretion after its assessment of relevant factors, including, without limitation, the Cardholder's creditworthiness, the status of the tradeline, and the potential value of any improvement in a Third-Party's credit scores as a result of being added as an authorized user on the Cardholder's tradeline.
            </div>
            <div style={styles.paragraph}>
              <strong>4.2</strong> No fee shall be paid to the Cardholder for its agreement to add a Third-Party to a tradeline until and unless the addition of the Third-Party as an authorized user of the Cardholder's trade-line has been reflected on the credit report of the Third-Party issued by Equifax, Experian, and Trans Union.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Time for Performance of Services</h2>
            <div style={styles.paragraph}>
              Following the execution of this Agreement by the parties, Easy Tradelines shall begin using its best efforts to identify Third-Parties who would benefit from being added as an authorized user on the Cardholder's tradeline.
            </div>
            <div style={styles.paragraph}>
              This Agreement shall continue until such time as it is terminated by either party. Either party may terminate this Agreement by providing not less than thirty (30) days written notice to the other.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Limitation of Liability</h2>
            <div style={styles.paragraph}>
              The total liability of Easy Tradelines shall not exceed the total amount of fees paid by the Third-Party. Card Holder assumes all risk that lenders may cancel, reduce, or terminate trade-lines.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>7. Electronic Consent</h2>
            <div style={styles.paragraph}>
              Card Holder consents to receive and send communications electronically with Easy Tradelines. Withdrawal of consent may slow transactions.
            </div>
            <div style={styles.paragraph}>
              Contact: info@easytradelines.com | (786) 460-5316
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>8. Governing Law</h2>
            <div style={styles.paragraph}>
              This Agreement shall be governed by the laws of the State of Florida.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>9. General Provisions</h2>
            <div style={styles.paragraph}>
              This Agreement comprises the entire agreement between the parties. All prior negotiations are superseded. Card Holder may not assign this Agreement without written consent of Easy Tradelines.
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
                Agreement signed successfully by {affiliateData.first_name} {affiliateData.last_name}
              </div>
            )}

            <div style={{marginTop: '16px', fontSize: '12px', color: '#6b7280', textAlign: 'center'}}>
              <p><strong>CARD HOLDER:</strong></p>
              <p>{affiliateData.first_name} {affiliateData.last_name}</p>
              <p>Email: {affiliateData.email}</p>
              <p>Phone: {affiliateData.phone}</p>
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

export default CardHolderAgreementPopup;
