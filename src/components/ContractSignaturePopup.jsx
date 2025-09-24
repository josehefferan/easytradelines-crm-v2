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
              <strong>d)</strong> Reseller will not contact, or make any attempt to contact, any of our Investors, or any co-borrower, lender or other grantor of credit, in connection with a credit facility made available through the Services at any time or for any reason. Reseller agrees that any contact by Reseller or a Client of a Easy Tradelines Investor, or any co-borrower, lender or other grantor of credit, in connection with a credit facility made available through the Services may result in the immediate termination of this Agreement, or of the Client's access to a credit facility made available through the Services, without notice or refund of any fees paid to Easy Tradelines by Reseller on account of this Agreement or by the Client on account of the credit facility made available through the Services.
            </div>
            <div style={styles.clause}>
              <strong>e)</strong> Reseller acknowledges and agrees that Easy Tradelines makes no representation or guarantee that the Services will result in any improvement of a Client's credit score associated with the Easy Tradelines Investor's trade-line for any purpose related to this Agreement. Reseller acknowledges and agrees that the addition of a Client as an authorized user to a credit facility made available through the Services is made for the sole and exclusive purpose of attempting to enhance the Client's FICO credit score and that Client is not authorized, by Easy Tradelines, the Investor, or the Reseller, to utilize any of the credit available under that credit facility for any other purpose at any time.
            </div>
            <div style={styles.clause}>
              <strong>f)</strong> Reseller will promptly notify Easy Tradelines of any material change to Client's name or contact information, including, but not limited to, telephone numbers, mailing addresses, and email addresses.
            </div>
            <div style={styles.clause}>
              <strong>g)</strong> Reseller will not make any representation to any Client that it is acting for or on behalf of Easy Tradelines with respect to the Services, and Reseller will immediately take all necessary and appropriate action to eliminate any understanding or impression of a Client that Reseller is acting as an agent for Easy Tradelines as to the Services.
            </div>
            <div style={styles.clause}>
              <strong>h)</strong> Reseller shall undertake a commercially reasonable review of its Clients' application for services, including without limitation, the use of Know-Your-Customer policies and procedures employed by financial institutions with respect to United States-based transactions, to verify the identity of such Client and the nature of such Client's credit and business activities. Reseller hereby represents and warrants with respect to each such Client referred to Easy Tradelines for services under this Agreement that: (i) it has independently verified the identity of every Client referred to Easy Tradelines for service under this Agreement; (ii) each Client referred by Reseller is the individual for whom the Social Security number provided to Easy Tradelines was issued to by the Social Security Administration; and (iii) a reasonable background check of each Client performed by Reseller has not revealed any red flags as to Client's creditworthiness.
            </div>
            
            <div style={styles.paragraph}>
              <strong>3.2</strong> Easy Tradelines Covenants, Representations, and Warranties. Easy Tradelines covenants, represents and warrants the following:
            </div>
            <div style={styles.clause}>
              <strong>a)</strong> Easy Tradelines does not and cannot guarantee any result or improvement in credit score as result of a Client's use of its Services.
            </div>
            <div style={styles.clause}>
              <strong>b)</strong> Easy Tradelines does not and cannot guarantee that any Client will be approved for any loan or credit request as a result of its Services.
            </div>
            <div style={styles.clause}>
              <strong>c)</strong> Easy Tradelines is not a credit repair company in that it does not attempt to correct inaccurate information on any credit report of a Client, does not submit or attempt to resolve credit disputes on behalf of the Client, and does not attempt to improve a Client's credit record or history.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Compensation</h2>
            <div style={styles.paragraph}>
              <strong>4.1</strong> In exchange for Easy Tradelines Services under this Agreement, the Reseller agrees to pay to Easy Tradelines a fee equal to the amount shown on the schedule of available credit facilities for the credit facility selected by the Reseller. Reseller acknowledges and agrees that the fees charged by Easy Tradelines for the availability of a credit facility varies significantly upon on a number of factors, including, without limitation, the specific program requested by Client, the current status of the Client's credit score and credit history, and the number and type of credit facilities sought by the Reseller. Refunds of any fees paid to Easy Tradelines by Reseller are subject to the terms and conditions set forth in the Service Manual.
            </div>
            <div style={styles.paragraph}>
              <strong>4.2</strong> No fee for Services is earned by Easy Tradelines or the Investor until and unless the Services are deemed completed. For purposes of this Agreement, Services are deemed to be completed, and the fee associated with such Services are deemed to be earned when the addition of the Client as an authorized user of the Investor's credit facility is confirmed.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Time for Performance of Services</h2>
            <div style={styles.paragraph}>
              <strong>5.1</strong> Following execution of this Agreement by the parties, Easy Tradelines will provide Reseller with a schedule of available credit facilities of Easy Tradelines Investors that may be suitable for potentially enhancing a Client's credit score. Notwithstanding anything in this Agreement to the contrary, Reseller acknowledges and agrees that it has the sole and exclusive responsibility to select a credit facility for its Clients, and further acknowledges and agrees that Easy Tradelines is not responsible for determining the suitability of any credit facility to the goals or needs of a Client.
            </div>
            <div style={styles.paragraph}>
              <strong>5.2</strong> Reseller acknowledges and agrees that Easy Tradelines is not involved in any manner whatsoever in the determination or assessment of a FICO score for a Client or whether, when or how a lender may provide information relating to the addition of a Client as an authorized user on a tradeline to a credit reporting bureau. Easy Tradelines Services are deemed complete when it receives confirmation a Client has been added as an authorized user of a tradeline made available under this Agreement.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Limitation of Liability</h2>
            <div style={styles.paragraph}>
              <strong>6.1</strong> THE TOTAL LIABILITY OF EASY TRADELINES, TOGETHER WITH ANY OF ITS EMPLOYEES, AGENTS, OFFICERS, DIRECTORS, SHAREHOLDERS AND AFFILIATES, FOR DAMAGES ON ACCOUNT OF CLAIMS ARISING FROM OR RELATED TO THIS AGREEMENT, WHETHER BASED ON CONTRACT LAW OR TORT LAW OR OTHERWISE, SHALL NOT EXCEED THE TOTAL AMOUNT OF FEES PAID TO EASY TRADELINES ON ACCOUNT OF THE CLIENT FOR WHOM SUCH CLAIMS ARISE OR RELATE.
            </div>
            <div style={styles.paragraph}>
              THE REMEDIES PROVIDED FOR IN THIS AGREEMENT ARE THE SOLE AND EXCLUSIVE REMEDIES FOR RESELLER AND ITS CLIENTS.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Compliance with Law, Policies and Procedures; No Agency</h2>
            <div style={styles.paragraph}>
              <strong>7.1</strong> Reseller shall, at all times, strictly comply with all laws applicable to the Services and shall comply with all policies and procedures established by Easy Tradelines as set forth in the Service Manual, as such laws, policies, procedures and Service Manual may be amended from time to time.
            </div>
            <div style={styles.paragraph}>
              <strong>7.2</strong> Reseller understands that it is not authorized by Easy Tradelines to act as its agent in connection with the Services and agrees that it will not make any representation or statement in any communication with any Client that is or could be construed as a statement that it represents Easy Tradelines in an agency capacity.
            </div>
            <div style={styles.paragraph}>
              <strong>7.3</strong> Nothing in this Agreement is intended to, nor shall it be construed as, creating a partnership, joint venture, agency or franchise arrangement between Reseller and Easy Tradelines.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Electronic Consent</h2>
            <div style={styles.paragraph}>
              <strong>8.1</strong> Reseller agrees, unless specifically requested otherwise, that by entering into this Agreement with Easy Tradelines Reseller affirms consent to receive, in an electronic format, all information, copies of agreements and correspondence from Easy Tradelines and to also send information in an electronic format unless previously agreed upon in writing with Easy Tradelines. Reseller consents and agrees that Easy Tradelines may provide any disclosure, statement, notice, receipt, modification, amendment, and all other evidence of transactions to Reseller by electronic means. All electronic communications will be deemed to be valid and authentic, and Reseller intends and agrees that those electronic communications will be given the same legal effect as written and signed paper communications. Reseller may withdraw the application of any Client at any time prior to the notification by Easy Tradelines of its placement of a Client with an Easy Tradelines Investor.
            </div>
            <div style={styles.paragraph}>
              Reseller may withdraw a Client application by written notice: (i) by email to: info@easytradelines.com or (ii) by first class United States mail addressed to the following:
            </div>
            <div style={styles.paragraph}>
              Smart Latinos Consulting Group LLC<br />
              777 NW 72ND AVE<br />
              STE 2008<br />
              MIAMI, FL 33126
            </div>
            <div style={styles.paragraph}>
              Any notice of withdrawal of a Client application under this Article 8 shall be deemed effective when received by Easy Tradelines.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Notice</h2>
            <div style={styles.paragraph}>
              <strong>9.1</strong> For any notice other than a withdrawal of a Client application under Article 8 above, Easy Tradelines and Reseller agree that such notice shall be given as follows:
            </div>
            <div style={styles.paragraph}>
              <strong>Easy Tradelines:</strong><br />
              Smart Latinos Consulting Group LLC<br />
              777 NW 72ND AVE<br />
              STE 2008<br />
              MIAMI, FL 33126
            </div>
            <div style={styles.paragraph}>
              <strong>RESELLER:</strong><br />
              {brokerData.first_name} {brokerData.last_name}<br />
              {brokerData.company_name}<br />
              {brokerData.phone}<br />
              {brokerData.email}
            </div>
            <div style={styles.paragraph}>
              <strong>Registered Agent authorized to receive service of process:</strong><br />
              BERQUEZ CONSULTING FIRM, CORP.<br />
              777 NW 72ND AVE<br />
              STE 2071<br />
              MIAMI, FL 33126
            </div>
            <div style={styles.paragraph}>
              Any notice under this Article 9 shall be deemed given when: (i) delivered in person; (ii) sent by facsimile transmission with a confirming copy sent by regular mail; or (iii) deposited into first class United States mail, either through certified or registered mail return receipt requested service, with the correct address of the recipient and full postage.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Confidential Information</h2>
            <div style={styles.paragraph}>
              <strong>10.1</strong> Easy Tradelines agrees it will not sell, copy, release, or disclose any information of a Client, other than to its employees, agents and Easy Tradelines Investors, without the written consent of Reseller; provided however, that Easy Tradelines may disclose Client information as required by valid legal process.
            </div>
            <div style={styles.paragraph}>
              <strong>10.2</strong> All information provided by Easy Tradelines to Reseller, including without limitation, this Agreement and the Service Manual, ("Easy Tradelines Information") shall be deemed to be proprietary and confidential. Other than its employees, officers, and directors with a need to know such information in order to fulfill the purposes of this Agreement, Reseller shall not disclose or share any Easy Tradelines Information with any person or entity without first obtaining the written consent of Easy Tradelines; provided however that Reseller may, with not less than three (3) business days prior written notice, disclose Easy Tradelines Information pursuant to valid legal process. In the event of an unauthorized disclosure or potential unauthorized disclosure, Easy Tradelines shall be entitled to obtain injunctive relief from any court of competent jurisdiction with the need to demonstrate irreparable harm, the absence of an adequate remedy at law or in equity, or damages, and without a requirement of the posting of a bond or other security.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Arbitration/Litigation</h2>
            <div style={styles.paragraph}>
              <strong>11.1</strong> In the event of any dispute, claim, question, or disagreement arising from or relating to this Agreement other than a dispute involving the payment of services rendered by Easy Tradelines, the parties hereto shall use their best efforts to settle the dispute, claim, question, or disagreement. To this effect, the parties shall consult and negotiate with each other in good faith and, recognizing their mutual interests, attempt to reach a just and equitable solution satisfactory to both parties. If they do not reach resolution within a period of sixty (60) days, then, upon notice by either party to the other, all disputes, claims, questions, or disagreements shall be resolved by binding arbitration administered by a single arbitrator mutually agreed upon by the parties. If the parties cannot agree upon a single arbitrator, each party shall select an arbitrator and these arbitrators shall select a single arbitrator who will arbitrate the dispute. The parties agree that jurisdiction and venue for any proceeding relating to this Agreement, including arbitration, shall be limited to the City and County of Los Angeles, State of California.
            </div>
            <div style={styles.paragraph}>
              <strong>11.2</strong> If Reseller fails to pay for the services rendered by Easy Tradelines, as result of a chargeback or credit card dispute initiated by any Client, Easy Tradelines shall be entitled to pursue collection proceedings against the Reseller in the County or District Court of the City and County of Los Angeles, State of California. Client consents to jurisdiction and venue in the City and County of Los Angeles, State of California. Where Easy Tradelines must seek legal recourse for the purpose of collecting or otherwise enforcing a judgment hereunder, such proceedings may be commenced in any appropriate venue. Reseller expressly waives any right to a jury trial if a collection proceeding is initiated by Easy Tradelines or its agents. In any legal proceeding or arbitration involving a dispute arising from or related to this Agreement, Easy Tradelines shall be entitled to recover from Reseller or the Client, or both as the case may be, the attorney fees and costs reasonably incurred by Easy Tradelines in such proceeding or arbitration, and if the dispute involves the non-payment of fees for Services rendered by Easy Tradelines, then Easy Tradelines shall be entitled to recover interest upon such fees at the rate of 19% per annum from the date such fees are due and payable through the date of collection.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Governing Law</h2>
            <div style={styles.paragraph}>
              <strong>12.1</strong> This Agreement shall be interpreted and governed by the laws of the State of Florida, without regard to its choice of law rules.
            </div>
            <div style={styles.paragraph}>
              <strong>12.2</strong> Unless otherwise provided by Florida law, Easy Tradelines and Client agree that in the event any legal proceeding concerning this Agreement is instituted, jurisdiction and venue of such proceeding shall be in a court of competent jurisdiction in Los Angeles County, California.
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>General Provisions</h2>
            <div style={styles.paragraph}>
              <strong>13.1</strong> This Agreement comprises the entire agreement between the parties. All prior negotiations and dealings between them are merged in, integrated and superseded by this Agreement, which is binding upon and ensures to the benefit of the parties and their successors, legal representatives and assigns.
            </div>
            <div style={styles.paragraph}>
              <strong>13.2</strong> Reseller may not assign this Agreement in whole or in part without the prior written consent of Easy Tradelines.
            </div>
            <div style={styles.paragraph}>
              <strong>13.3</strong> In case any term, phrase, clause, paragraph, article, restriction, or covenant contained in this Agreement shall be held to be invalid or unenforceable, the same shall be deemed, and it is hereby agreed that the same are meant to be several, and shall not defeat or impair the remaining provisions hereof.
            </div>
            <div style={styles.paragraph}>
              <strong>13.4</strong> If performance of this Agreement or any obligation under this Agreement is prevented, restricted, or interfered with by causes beyond either party's reasonable control ("Force Majeure") and if the party unable to carry out its obligations gives the other party prompt written notice of such event, then the obligations of the party invoking this provision shall be suspended to the extent necessary by such event. The term Force Majeure shall include, without limitation, acts of God, fire, explosion, vandalism, storm or other similar occurrence, orders or acts of military or civil authority, or by national emergencies, insurrections, riots, or wars, or strikes, lock-outs, work stoppages. The excused party shall use reasonable efforts under the circumstances to avoid or remove such causes of non-performance and shall proceed to perform with reasonable dispatch whenever such causes are removed or ceased.
            </div>
            <div style={styles.paragraph}>
              <strong>13.5</strong> This Agreement may only be modified or amended by a writing signed by Easy Tradelines and Reseller.
            </div>
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
