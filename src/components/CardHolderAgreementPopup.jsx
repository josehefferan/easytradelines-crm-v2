import React, { useState, useRef } from 'react';
import { X, FileText, Download, Edit2 } from 'lucide-react';

const CardHolderAgreementPopup = ({ isOpen, onClose, affiliateData = {}, onSignComplete, mode = 'affiliate' }) => {
  const [formData, setFormData] = useState({
    cardHolderName: `${affiliateData.first_name || ''} ${affiliateData.last_name || ''}`.trim(),
    cardHolderAddress: '',
    investorName: `${affiliateData.first_name || ''} ${affiliateData.last_name || ''}`.trim(),
    investorAddress: '',
    investorPhone: affiliateData.phone || '',
    investorEmail: affiliateData.email || '',
    cardHolderFullName: '',
    affiliateSignature: '',
    easyTradeLinesAgent: '',
    easyTradeLinesInitials: '',
    initials: '',
    isDraft: false,
    completedByAffiliate: false,
    canEdit: true // Permitir edición
  });

  const [currentStep, setCurrentStep] = useState(() => {
    if (mode === 'affiliate') return 'affiliate';
    if (mode === 'admin') return 'admin';
    return 'review';
  });

  const signatureCanvasRef = useRef(null);
  const affiliateCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAffiliateDrawing, setIsAffiliateDrawing] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones de canvas (sin cambios)
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startAffiliateDrawing = (e) => {
    setIsAffiliateDrawing(true);
    const canvas = affiliateCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawAffiliate = (e) => {
    if (!isAffiliateDrawing) return;
    
    const canvas = affiliateCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopAffiliateDrawing = () => {
    setIsAffiliateDrawing(false);
  };

  const clearAffiliateSignature = () => {
    const canvas = affiliateCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Función para generar PDF
  const generatePDF = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; font-size: 18px; margin-bottom: 30px;">CARD HOLDER AGREEMENT</h1>
        
        <p>This Agreement is entered into on the <strong>${new Date().getDate()}</strong> day of <strong>${new Date().toLocaleDateString('en-US', { month: 'long' })}</strong>, <strong>${new Date().getFullYear()}</strong>, by and between Smart Latinos Consulting Group, doing business as Easy Tradelines, herein after referred to as "Easy Tradelines", and <strong>${formData.cardHolderName}</strong>, whose address is <strong>${formData.cardHolderAddress}</strong>, hereinafter called "Card Holder".</p>

        <h3>1. PURPOSE</h3>
        <p>The purpose of this Agreement is to establish the terms and conditions under which Easy Tradelines will provide authorized user tradeline services to the Card Holder for the purpose of improving the Card Holder's credit profile and credit scores.</p>

        <h3>2. SERVICES PROVIDED</h3>
        <p>Easy Tradelines agrees to add the Card Holder as an authorized user to selected credit accounts. Services include but are not limited to: account selection based on Card Holder's credit profile, application processing and management, monitoring and verification of tradeline reporting to credit bureaus, and customer support throughout the service period.</p>

        <h3>3. COVENANTS AND WARRANTIES</h3>
        <p>The Card Holder warrants that all information provided is accurate, complete, and truthful. Card Holder agrees not to use the tradeline accounts for any purchases or transactions. Easy Tradelines warrants that all tradeline accounts are in good standing, have positive payment history, and will be maintained during the agreed service period.</p>

        <h3>4. COMPENSATION</h3>
        <p>Payment terms and compensation structure are defined in the separate fee schedule provided to Card Holder. All payments are due in advance of services rendered. No refunds will be provided once tradelines begin reporting to credit bureaus unless Easy Tradelines fails to deliver agreed services.</p>

        <h3>5. PERFORMANCE TIMEFRAMES</h3>
        <p>Services will be initiated within 7-14 business days of payment receipt and completion of all required documentation. Tradeline reporting to credit bureaus typically occurs within 1-2 billing cycles of account setup. Card Holder acknowledges that credit bureau reporting timelines are beyond Easy Tradelines' direct control.</p>

        <h3>6. LIABILITY LIMITATIONS</h3>
        <p>Easy Tradelines' total liability is limited to the amount paid for services. Neither party shall be liable for indirect, consequential, special, or punitive damages. Card Holder acknowledges that credit score improvements cannot be guaranteed and results may vary.</p>

        <h3>7. ELECTRONIC CONSENT</h3>
        <p>Both parties consent to conducting business electronically and agree that electronic signatures shall have the same force and effect as original signatures. All communications may be conducted via email, and electronic records shall constitute sufficient documentation.</p>

        <h3>8. NOTICE - INVESTOR INFORMATION</h3>
        <p><strong>INVESTOR:</strong></p>
        <p>Name: <strong>${formData.investorName}</strong></p>
        <p>Address: <strong>${formData.investorAddress}</strong></p>
        <p>Phone: <strong>${formData.investorPhone}</strong></p>
        <p>Email: <strong>${formData.investorEmail}</strong></p>

        <h3>9. ARBITRATION</h3>
        <p>Any disputes arising from this Agreement that cannot be resolved through direct negotiation within 60 days shall be settled by binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the state of Florida, and the decision of the arbitrator shall be final and binding.</p>

        <h3>10. GOVERNING LAW</h3>
        <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law principles. Any legal action must be brought in the courts of Florida.</p>

        <h3>11. GENERAL PROVISIONS</h3>
        <p>This Agreement comprises the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements. No modification of this Agreement shall be effective unless in writing and signed by both parties. Card Holder may not assign this Agreement without prior written consent of Easy Tradelines. If any provision is found unenforceable, the remainder shall remain in full force.</p>
        
        <div style="margin-top: 40px;">
          <p><strong>Card Holder Full Name:</strong> ${formData.cardHolderFullName}</p>
          <p><strong>Card Holder Signature:</strong> [Signed Electronically]</p>
          <p><strong>Initials:</strong> ${formData.initials} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> ${currentDate}</p>
          
          <br><br>
          
          <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
          <p><strong>By:</strong> ${formData.easyTradeLinesAgent} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> ${currentDate}</p>
          <p><strong>Initials:</strong> ${formData.easyTradeLinesInitials} &nbsp;&nbsp;&nbsp; I have read and understood the document</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Card Holder Agreement - ${formData.cardHolderName}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveDraft = () => {
    const draftData = {
      ...formData,
      isDraft: true,
      completedByAffiliate: true,
      affiliate_completion_date: new Date().toISOString()
    };
    onSignComplete({ contractData: draftData, isDraft: true });
  };

  const handleFinalizeDocument = () => {
    const finalData = {
      ...formData,
      isDraft: false,
      completedByAdmin: true,
      final_completion_date: new Date().toISOString(),
      contract_signed: true
    };
    onSignComplete({ contractData: finalData, isFinalized: true });
  };

  const handleSign = () => {
    const canvas = signatureCanvasRef.current;
    const affiliateCanvas = affiliateCanvasRef.current;
    const signatureDataUrl = canvas?.toDataURL() || '';
    const affiliateSignatureDataUrl = affiliateCanvas?.toDataURL() || '';
    
    const contractData = {
      ...formData,
      signature_data: signatureDataUrl,
      affiliate_signature_data: affiliateSignatureDataUrl,
      signature_date: new Date().toISOString(),
      contract_signed: true
    };
    onSignComplete({ contractData });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '95vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            <FileText size={24} />
            Card Holder Agreement
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(currentStep === 'admin' || currentStep === 'review') && (
              <button 
                onClick={generatePDF}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={16} />
                PDF
              </button>
            )}
            {formData.contract_signed && (
              <button 
                onClick={() => setCurrentStep('affiliate')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit2 size={16} />
                Edit
              </button>
            )}
            <button onClick={onClose} style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: '6px',
              color: '#6b7280'
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{
          padding: '24px',
          maxHeight: 'calc(95vh - 200px)', // Aumenté el espacio para los botones
          overflowY: 'auto',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#374151'
        }}>
          
          {currentStep === 'affiliate' && (
            <>
              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                CARD HOLDER AGREEMENT - AFFILIATE SECTION
              </div>
              
              <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #2196f3' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Instructions for Affiliate</h4>
                <p style={{ margin: '0', fontSize: '14px' }}>Please complete all the highlighted fields below and provide your signature. Once completed, click "Save as Draft" to send to admin for finalization.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p>
                  This Agreement is entered into on the{' '}
                  <strong>{new Date().getDate()}</strong> day of{' '}
                  <strong>{new Date().toLocaleDateString('en-US', { month: 'long' })}</strong>, <strong>{new Date().getFullYear()}</strong>, by and between
                  Smart Latinos Consulting Group, doing business as Easy Tradelines, herein after
                  referred to as "Easy Tradelines", and{' '}
                  <input
                    type="text"
                    value={formData.cardHolderName}
                    onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                    placeholder="Card Holder Name"
                    style={{
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '200px',
                      outline: 'none'
                    }}
                  />, whose address
                  is{' '}
                  <input
                    type="text"
                    value={formData.cardHolderAddress}
                    onChange={(e) => handleInputChange('cardHolderAddress', e.target.value)}
                    placeholder="Full Address"
                    style={{
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '250px',
                      outline: 'none'
                    }}
                  />, hereinafter called "Card Holder".
                </p>
              </div>

              {/* TEXTO COMPLETO - NO RESUMIDO */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>1. PURPOSE</div>
                <p>The purpose of this Agreement is to establish the terms and conditions under which Easy Tradelines will provide authorized user tradeline services to the Card Holder for the purpose of improving the Card Holder's credit profile and credit scores.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>2. SERVICES PROVIDED</div>
                <p>Easy Tradelines agrees to add the Card Holder as an authorized user to selected credit accounts. Services include but are not limited to: account selection based on Card Holder's credit profile, application processing and management, monitoring and verification of tradeline reporting to credit bureaus, and customer support throughout the service period.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>3. COVENANTS AND WARRANTIES</div>
                <p>The Card Holder warrants that all information provided is accurate, complete, and truthful. Card Holder agrees not to use the tradeline accounts for any purchases or transactions. Easy Tradelines warrants that all tradeline accounts are in good standing, have positive payment history, and will be maintained during the agreed service period.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>4. COMPENSATION</div>
                <p>Payment terms and compensation structure are defined in the separate fee schedule provided to Card Holder. All payments are due in advance of services rendered. No refunds will be provided once tradelines begin reporting to credit bureaus unless Easy Tradelines fails to deliver agreed services.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>5. PERFORMANCE TIMEFRAMES</div>
                <p>Services will be initiated within 7-14 business days of payment receipt and completion of all required documentation. Tradeline reporting to credit bureaus typically occurs within 1-2 billing cycles of account setup. Card Holder acknowledges that credit bureau reporting timelines are beyond Easy Tradelines' direct control.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>6. LIABILITY LIMITATIONS</div>
                <p>Easy Tradelines' total liability is limited to the amount paid for services. Neither party shall be liable for indirect, consequential, special, or punitive damages. Card Holder acknowledges that credit score improvements cannot be guaranteed and results may vary.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>7. ELECTRONIC CONSENT</div>
                <p>Both parties consent to conducting business electronically and agree that electronic signatures shall have the same force and effect as original signatures. All communications may be conducted via email, and electronic records shall constitute sufficient documentation.</p>
              </div>

              {/* Sección 8 - NOTICE */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>8. NOTICE - INVESTOR INFORMATION</div>
                <p><strong>INVESTOR:</strong></p>
                <div style={{ marginLeft: '20px' }}>
                  <p>
                    Name:{' '}
                    <input
                      type="text"
                      value={formData.investorName}
                      onChange={(e) => handleInputChange('investorName', e.target.value)}
                      placeholder="Investor Name"
                      style={{
                        backgroundColor: '#fff3cd',
                        border: '2px solid #ffc107',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        margin: '0 4px',
                        minWidth: '200px',
                        outline: 'none'
                      }}
                    />
                  </p>
                  <p>
                    Address:{' '}
                    <input
                      type="text"
                      value={formData.investorAddress}
                      onChange={(e) => handleInputChange('investorAddress', e.target.value)}
                      placeholder="Full Address"
                      style={{
                        backgroundColor: '#fff3cd',
                        border: '2px solid #ffc107',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        margin: '0 4px',
                        minWidth: '250px',
                        outline: 'none'
                      }}
                    />
                  </p>
                  <p>
                    Phone:{' '}
                    <input
                      type="text"
                      value={formData.investorPhone}
                      onChange={(e) => handleInputChange('investorPhone', e.target.value)}
                      placeholder="Phone Number"
                      style={{
                        backgroundColor: '#fff3cd',
                        border: '2px solid #ffc107',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        margin: '0 4px',
                        minWidth: '150px',
                        outline: 'none'
                      }}
                    />
                  </p>
                  <p>
                    Email:{' '}
                    <input
                      type="email"
                      value={formData.investorEmail}
                      onChange={(e) => handleInputChange('investorEmail', e.target.value)}
                      placeholder="Email Address"
                      style={{
                        backgroundColor: '#fff3cd',
                        border: '2px solid #ffc107',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        margin: '0 4px',
                        minWidth: '200px',
                        outline: 'none'
                      }}
                    />
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>9. ARBITRATION</div>
                <p>Any disputes arising from this Agreement that cannot be resolved through direct negotiation within 60 days shall be settled by binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the state of Florida, and the decision of the arbitrator shall be final and binding.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>10. GOVERNING LAW</div>
                <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law principles. Any legal action must be brought in the courts of Florida.</p>
              </div>

              {/* Sección 11 - Signatures */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>11. GENERAL PROVISIONS</div>
                <p>This Agreement comprises the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements. No modification of this Agreement shall be effective unless in writing and signed by both parties. Card Holder may not assign this Agreement without prior written consent of Easy Tradelines. If any provision is found unenforceable, the remainder shall remain in full force.</p>
                
                <br />
                <p>
                  Card Holder Full Name:{' '}
                  <input
                    type="text"
                    value={formData.cardHolderFullName}
                    onChange={(e) => handleInputChange('cardHolderFullName', e.target.value)}
                    placeholder="CardHolder Full Name"
                    style={{
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '250px',
                      outline: 'none'
                    }}
                  />
                </p>
                <br />
                <p>Affiliate Signature:</p>
                <div style={{ marginLeft: '20px', marginBottom: '15px' }}>
                  <canvas
                    ref={affiliateCanvasRef}
                    width={350}
                    height={100}
                    style={{
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      cursor: 'crosshair',
                      backgroundColor: '#fff3cd'
                    }}
                    onMouseDown={startAffiliateDrawing}
                    onMouseMove={drawAffiliate}
                    onMouseUp={stopAffiliateDrawing}
                    onMouseLeave={stopAffiliateDrawing}
                  />
                  <br />
                  <button
                    type="button"
                    onClick={clearAffiliateSignature}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      marginTop: '5px'
                    }}
                  >
                    Clear Signature
                  </button>
                </div>
                <br />
                <p>
                  By: initial{' '}
                  <input
                    type="text"
                    value={formData.initials}
                    onChange={(e) => handleInputChange('initials', e.target.value)}
                    placeholder="Initials"
                    maxLength="5"
                    style={{
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '80px',
                      outline: 'none'
                    }}
                  />{' '}
                  Date: <strong>{currentDate}</strong>
                </p>
              </div>
            </>
          )}

          {currentStep === 'admin' && (
            <>
              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                CARD HOLDER AGREEMENT - ADMIN COMPLETION
              </div>
              
              <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #4caf50' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Instructions for Admin</h4>
                <p style={{ margin: '0', fontSize: '14px' }}>Complete the EasyTradelines representative information below and finalize the document.</p>
              </div>

              {/* Mostrar datos del affiliate */}
              <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4>Affiliate Information (Completed)</h4>
                <p><strong>Card Holder:</strong> {formData.cardHolderName}</p>
                <p><strong>Address:</strong> {formData.cardHolderAddress}</p>
                <p><strong>Phone:</strong> {formData.investorPhone}</p>
                <p><strong>Email:</strong> {formData.investorEmail}</p>
                <p><strong>Full Name:</strong> {formData.cardHolderFullName}</p>
                <p><strong>Initials:</strong> {formData.initials}</p>
                <p style={{ color: '#4caf50', fontWeight: '500' }}>✓ Affiliate signature completed</p>
              </div>

              {/* Sección para completar por admin */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>EASY TRADELINES COMPLETION</div>
                <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
                <p>
                  By:{' '}
                  <input
                    type="text"
                    value={formData.easyTradeLinesAgent}
                    onChange={(e) => handleInputChange('easyTradeLinesAgent', e.target.value)}
                    placeholder="EasyTradelines agent"
                    style={{
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '200px',
                      outline: 'none'
                    }}
                  />{' '}
                  Date: <strong>{currentDate}</strong>
                </p>
                <br />
                <p>
                  initial{' '}
                  <input
                    type="text"
                    value={formData.easyTradeLinesInitials}
                    onChange={(e) => handleInputChange('easyTradeLinesInitials', e.target.value)}
                    placeholder="EasyTradelines agent initials"
                    maxLength="5"
                    style={{
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '80px',
                      outline: 'none'
                    }}
                  />{' '}
                  I have read and understood the document
                </p>
              </div>
            </>
          )}

          {currentStep === 'review' && (
            <>
              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                COMPLETE CARD HOLDER AGREEMENT
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p>
                  This Agreement is entered into on the{' '}
                  <strong>{new Date().getDate()}</strong> day of{' '}
                  <strong>{new Date().toLocaleDateString('en-US', { month: 'long' })}</strong>, <strong>{new Date().getFullYear()}</strong>, by and between
                  Smart Latinos Consulting Group, doing business as Easy Tradelines, herein after
                  referred to as "Easy Tradelines", and <strong>{formData.cardHolderName}</strong>, whose address
                  is <strong>{formData.cardHolderAddress}</strong>, hereinafter called "Card Holder".
                </p>
              </div>

              {/* Documento completo para revisión */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>1. PURPOSE</div>
                <p>The purpose of this Agreement is to establish the terms and conditions under which Easy Tradelines will provide authorized user tradeline services to the Card Holder for the purpose of improving the Card Holder's credit profile and credit scores.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>2. SERVICES PROVIDED</div>
                <p>Easy Tradelines agrees to add the Card Holder as an authorized user to selected credit accounts. Services include but are not limited to: account selection based on Card Holder's credit profile, application processing and management, monitoring and verification of tradeline reporting to credit bureaus, and customer support throughout the service period.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>3. COVENANTS AND WARRANTIES</div>
                <p>The Card Holder warrants that all information provided is accurate, complete, and truthful. Card Holder agrees not to use the tradeline accounts for any purchases or transactions. Easy Tradelines warrants that all tradeline accounts are in good standing, have positive payment history, and will be maintained during the agreed service period.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>4. COMPENSATION</div>
                <p>Payment terms and compensation structure are defined in the separate fee schedule provided to Card Holder. All payments are due in advance of services rendered. No refunds will be provided once tradelines begin reporting to credit bureaus unless Easy Tradelines fails to deliver agreed services.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>5. PERFORMANCE TIMEFRAMES</div>
                <p>Services will be initiated within 7-14 business days of payment receipt and completion of all required documentation. Tradeline reporting to credit bureaus typically occurs within 1-2 billing cycles of account setup. Card Holder acknowledges that credit bureau reporting timelines are beyond Easy Tradelines' direct control.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>6. LIABILITY LIMITATIONS</div>
                <p>Easy Tradelines' total liability is limited to the amount paid for services. Neither party shall be liable for indirect, consequential, special, or punitive damages. Card Holder acknowledges that credit score improvements cannot be guaranteed and results may vary.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>7. ELECTRONIC CONSENT</div>
                <p>Both parties consent to conducting business electronically and agree that electronic signatures shall have the same force and effect as original signatures. All communications may be conducted via email, and electronic records shall constitute sufficient documentation.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>8. NOTICE - INVESTOR INFORMATION</div>
                <p><strong>INVESTOR:</strong></p>
                <div style={{ marginLeft: '20px' }}>
                  <p>Name: <strong>{formData.investorName}</strong></p>
                  <p>Address: <strong>{formData.investorAddress}</strong></p>
                  <p>Phone: <strong>{formData.investorPhone}</strong></p>
                  <p>Email: <strong>{formData.investorEmail}</strong></p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>9. ARBITRATION</div>
                <p>Any disputes arising from this Agreement that cannot be resolved through direct negotiation within 60 days shall be settled by binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the state of Florida, and the decision of the arbitrator shall be final and binding.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>10. GOVERNING LAW</div>
                <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law principles. Any legal action must be brought in the courts of Florida.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>11. GENERAL PROVISIONS</div>
                <p>This Agreement comprises the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements. No modification of this Agreement shall be effective unless in writing and signed by both parties. Card Holder may not assign this Agreement without prior written consent of Easy Tradelines. If any provision is found unenforceable, the remainder shall remain in full force.</p>
                
                <div style={{ marginTop: '30px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                  <p><strong>Card Holder Full Name:</strong> {formData.cardHolderFullName}</p>
                  <p><strong>Card Holder Signature:</strong> ✓ Signed</p>
                  <p><strong>Initials:</strong> {formData.initials} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> {currentDate}</p>
                  
                  <br />
                  
                  <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
                  <p><strong>By:</strong> {formData.easyTradeLinesAgent} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> {currentDate}</p>
                  <p><strong>Initials:</strong> {formData.easyTradeLinesInitials} &nbsp;&nbsp;&nbsp; I have read and understood the document</p>
                </div>
              </div>
            </>
          )}

          {currentStep === 'sign' && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3>Electronic Signature</h3>
              <p>Please sign below to agree to the terms and conditions:</p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Initials:
                </label>
                <input
                  type="text"
                  value={formData.initials}
                  onChange={(e) => handleInputChange('initials', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    width: '100px'
                  }}
                  placeholder="Your initials"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Signature:
                </label>
                <canvas
                  ref={signatureCanvasRef}
                  width={400}
                  height={150}
                  style={{
                    border: '2px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'crosshair',
                    backgroundColor: 'white'
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <button
                  onClick={clearSignature}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    marginTop: '8px'
                  }}
                >
                  Clear Signature
                </button>
              </div>

              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                Date: {currentDate}
              </p>
              
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '16px' }}>
                ☑️ I have read and understood the document
              </p>
            </div>
          )}
        </div>

        {/* Footer con margen aumentado para que se vean los botones */}
        <div style={{
          padding: '20px 24px', // Aumenté el padding
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#f8fafc',
          minHeight: '80px' // Altura mínima garantizada
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px', // Botones más grandes
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#374151'
            }}
          >
            Cancel
          </button>
          
          {currentStep === 'affiliate' && (
            <button
              onClick={handleSaveDraft}
              style={{
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: '#16a34a',
                color: 'white'
              }}
            >
              Save as Draft
            </button>
          )}
          
          {currentStep === 'admin' && (
            <>
              <button
                onClick={() => setCurrentStep('review')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: '#6b7280',
                  color: 'white'
                }}
              >
                Preview Complete
              </button>
              <button
                onClick={handleFinalizeDocument}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: '#7c3aed',
                  color: 'white'
                }}
              >
                Finalize Agreement
              </button>
            </>
          )}
          
          {currentStep === 'review' && (
            <>
              <button
                onClick={() => setCurrentStep('admin')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: '#6b7280',
                  color: 'white'
                }}
              >
                Back to Edit
              </button>
              <button
                onClick={() => setCurrentStep('sign')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: '#16a34a',
                  color: 'white'
                }}
              >
                Proceed to Sign
              </button>
            </>
          )}
          
          {currentStep === 'sign' && (
            <>
              <button
                onClick={() => setCurrentStep('review')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: '#6b7280',
                  color: 'white'
                }}
              >
                Back to Review
              </button>
              <button
                onClick={handleSign}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: '#7c3aed',
                  color: 'white'
                }}
              >
                Complete Agreement
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardHolderAgreementPopup;
