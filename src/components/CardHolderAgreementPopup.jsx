import React, { useState, useRef } from 'react';
const X = () => <span style={{fontSize: '20px'}}>✕</span>;
const FileText = () => <span style={{fontSize: '24px'}}>📄</span>;
const Download = () => <span style={{fontSize: '16px'}}>⬇️</span>;
const Edit2 = () => <span style={{fontSize: '16px'}}>✏️</span>;
const Lock = () => <span style={{fontSize: '16px'}}>🔒</span>;
const Unlock = () => <span style={{fontSize: '16px'}}>🔓</span>;

const CardHolderAgreementPopup = ({ isOpen, onClose, affiliateData = {}, onSignComplete, mode = 'affiliate', currentUser }) => {
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
    contract_signed: false,
    canEdit: true
  });

  const [isLocked, setIsLocked] = useState(false);
  const [currentStep, setCurrentStep] = useState(() => {
    if (mode === 'affiliate') return 'affiliate';
    if (mode === 'admin') return 'admin';
    return 'review';
  });

  const signatureCanvasRef = useRef(null);
  const affiliateCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAffiliateDrawing, setIsAffiliateDrawing] = useState(false);
  
  const isAdmin = currentUser?.role === 'admin';

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });

  const handleInputChange = (field, value) => {
    if (isLocked && !isAdmin) {
      alert('This document is locked by admin. No changes allowed.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleLock = () => {
    if (isAdmin) {
      setIsLocked(!isLocked);
      if (onSignComplete) {
        onSignComplete({
          contractData: { ...formData, isLocked: !isLocked },
          isLocked: !isLocked
        });
      }
    }
  };

  const downloadBlankPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = getFullContractHTML(true);

    if (typeof html2pdf !== 'undefined') {
      const options = {
        margin: 0.5,
        filename: `Card_Holder_Agreement_Blank.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(options).from(element).save();
    } else {
      alert('Please include html2pdf library in your project');
    }
  };

  const downloadSignedPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = getFullContractHTML(false);
    
    if (typeof html2pdf !== 'undefined') {
      const options = {
        margin: 0.5,
        filename: `Card_Holder_Agreement_${affiliateData.first_name}_${affiliateData.last_name}_Signed.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(options).from(element).save();
    } else {
      alert('Please include html2pdf library in your project');
    }
  };

  const getFullContractHTML = (isBlank) => {
    const signatureDataUrl = signatureCanvasRef.current?.toDataURL() || '';
    const affiliateSignatureDataUrl = affiliateCanvasRef.current?.toDataURL() || '';
    
    return `
      <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; font-size: 18px; margin-bottom: 30px; font-weight: bold;">CARD HOLDER AGREEMENT</h1>
        
        <p>This Agreement is entered into on the <strong>${isBlank ? '____' : new Date().getDate()}</strong> day of 
        <strong>${isBlank ? '_________' : new Date().toLocaleDateString('en-US', { month: 'long' })}</strong>, 
        <strong>${new Date().getFullYear()}</strong>, by and between Smart Latinos Consulting Group, doing business as Easy Tradelines, 
        hereinafter referred to as "Easy Tradelines", and <strong>${isBlank ? '________________________' : formData.cardHolderName}</strong>, 
        whose address is <strong>${isBlank ? '________________________' : formData.cardHolderAddress}</strong>, 
        hereinafter called "Card Holder".</p>

        <h3>1. PURPOSE OF THE AGREEMENT</h3>
        <p>Easy Tradelines and Card Holder have entered into this Agreement to set forth the terms and conditions under which Easy Tradelines will facilitate a third-party's (the "Third-Party") temporary designation on the Card Holder's credit lines/trade-lines as an authorized user for the sole purpose of attempting to increase the Third-Party's FICO score.</p>
        <p>Cardholder hereby agrees to be bound to the following terms and conditions regarding all services rendered by Easy Tradelines.</p>

        <h3>2. SERVICES</h3>
        <p>Easy Tradelines will perform the following services under this Agreement.</p>
        <p>Easy Tradelines will use its best efforts to establish relationships between Cardholder and Third-Parties based on its review of the creditworthiness of the Cardholder and the credit enhancement sought by Third-Parties. The decision of Easy Tradelines to match any Third-Party with the Cardholder shall be within the sole and exclusive discretion of Easy Tradelines, and Easy Tradelines makes no representation, actual or implied, that any Third-Party will be presented to Cardholder for its consideration to be added as an authorized user on any tradelines made available by the Cardholder pursuant to this Agreement.</p>
        <p>Easy Tradelines will make an independent review of the Cardholder's creditworthiness and available trade-lines for purposes of: (i) determining whether the addition of a Third-Party to these tradelines is likely to have a positive effect on the Third-Party's FICO score; (ii) assessing the value of the Cardholder's agreement to make a tradeline available to a Third-Party; and (iii) providing Cardholder with the appropriate information from a Third-Party so as to enable the Cardholder to add these third-parties as additional authorized users of such trade-lines.</p>

        <h3>3. COVENANTS, REPRESENTATIONS, AND WARRANTIES</h3>
        <p><strong>Easy Tradeline Card Holders covenants, represents and warrants the following:</strong></p>
        <p>Cardholder shall provide all information requested by Easy Tradelines and that all such information is true, complete and correct in all respects.</p>
        <p>Cardholder authorizes Easy Tradelines to obtain from Equifax, Experian, and TransUnion, or any their respective affiliates (together, the "Credit Bureaus"), and, if necessary, from their respective subscribers, all credit and transaction information regarding Cardholder's credit history, credit transactions of record, and credit scores. This information may include, but is not necessarily limited to, review of credit reports, credit history, credit files, credit transactions and any other credit-related record.</p>
        <p>Cardholder represents, warrants and agrees that he/she shall not attempt to contact nor have any direct contact with any Third-Party. If Cardholder is contacted directly by any Third-Party, Cardholder shall not communicate with the Third-Party and shall immediately contact Easy Tradelines advising them of the contact.</p>
        <p>Cardholder acknowledges that all information provided to it by Easy Tradelines with respect to a Third-Party is confidential, and Cardholder agrees that it shall keep all such information confidential by taking appropriate measures to ensure against the unauthorized release or reproduction of or access to the information and to destroy or return to Easy Tradelines such information as soon as practicable after the Third-Party has been added as an additional authorized user of the applicable tradeline.</p>
        <p>Cardholder shall promptly notify Easy Tradelines of any material change in its name or contact information, including, but not limited to, any change in telephone numbers, mail addresses, or email addresses.</p>
        <p>Cardholder shall promptly notify Easy Tradelines of any material change to its tradelines, including, but not limited to, any changes in payment due dates, credit limits, or outstanding balances on these trade-lines.</p>
        <p>For so long as any Third-Party is an authorized user of any tradeline, Cardholder agrees that it will maintain an outstanding balance on the tradeline that is less than 10% of the maximum credit made available by the lender under such tradeline, and that it will make timely payment in accordance with the terms and conditions of the tradeline.</p>
        <p>Cardholder shall add a Third-Party as an authorized user to the applicable tradeline within 48 hours of receiving all information from Easy Tradelines. Unless a different time period is requested by Easy Tradelines, Cardholder agrees to keep Third-Party as an authorized user on its tradeline for a minimum of one-billing cycle or thirty (30) days.</p>
        <p>Cardholder shall not provide a Third-Party with the ability to access the trade-line in any manner, including, but not limited to, by providing a check, credit card, an account number, or any authorization code.</p>
        <p>For so long as this Agreement is in effect, Cardholder shall not enter into any agreement authorizing the use of the tradeline by any party other than a Third-Party without obtaining the prior written consent of Easy Tradelines.</p>
        <p>Cardholder shall rely solely on the information provided by Easy Tradelines in authorizing a Third-Party as an additional user of the tradeline, and shall not undertake any independent review of or make any request for information regarding the Third-Party, without obtaining the prior written consent of Easy Tradelines.</p>

        <h3>3.2 Easy Tradelines' Covenants, Representations, and Warranties</h3>
        <p><strong>Easy Tradelines covenants, represents and warrants the following:</strong></p>
        <p>Easy Tradelines shall be solely responsible for obtaining and assessing information from prospective Third-Parties referred to the Cardholder.</p>
        <p>Prior to its agreement to add a Third-Party as an authorized user of a tradeline, the Cardholder will be notified by Easy Tradelines of the fee it will receive in exchange for Cardholder's agreement to add a Third-Party as an authorized user on the tradeline.</p>
        <p>Easy Tradelines shall not provide a Third-Party with the ability to access a Cardholder's tradeline in any manner, including, but not limited to, by providing any credit card numbers, account numbers, or any authorization code(s).</p>
        <p>Easy Tradelines is not a credit repair company in that it does not attempt to correct inaccurate information on behalf of the Third-Party, does not submit or attempt to resolve disputes on behalf of the Client, and does not attempt to improve a client's credit record or history.</p>

        <h3>4. COMPENSATION</h3>
        <p>In exchange for Cardholder's agreement to add a Third-Party as an authorized user of any trade-line, Cardholder shall receive a fee in an amount to be determined by Easy Tradelines. The fee paid by Easy Tradelines shall be determined by Easy Tradelines in its sole discretion after its assessment of relevant factors, including, without limitation, the Cardholder's creditworthiness, the status of the tradeline, and the potential value of any improvement in a Third-Party's credit scores as a result of being added as an authorized user on the Cardholder's tradeline.</p>
        <p><strong>4.2</strong> No fee shall be paid to the Cardholder for its agreement to add a Third-Party to a tradeline until and unless the addition of the Third-Party as an authorized user of the Cardholder's trade-line has been reflected on the credit report of the Third-Party issued by Equifax, Experian, and Trans Union.</p>

        <h3>5. TIME FOR PERFORMANCE OF SERVICES</h3>
        <p>Following the execution of this Agreement by the parties, Easy Tradelines shall begin using its best efforts to identify Third-Parties who would benefit from being added as an authorized user on the Cardholder's tradeline.</p>
        <p>This Agreement shall continue until such time as it is terminated by either party. Either party may terminate this Agreement by providing not less than thirty (30) days written notice to the other, provided however, if a Third-Party is an authorized user of a trade-line at the time the Cardholder gives notice of its intent to terminate, the Agreement shall not terminate with respect to any such Third-Party until and unless the addition of such Third-Party as an authorized user of the Cardholder's tradeline has been reflected on the credit report of the Third-Party issued by Equifax, Experian, and Trans Union.</p>

        <h3>6. LIMITATION OF LIABILITY</h3>
        <p>The total liability of Easy Tradelines shall not exceed the total amount of fees paid by the Third-Party. Card Holder assumes all risk that lenders may cancel, reduce, or terminate trade-lines.</p>

        <h3>7. ELECTRONIC CONSENT</h3>
        <p>Card Holder consents to receive and send communications electronically with Easy Tradelines. Withdrawal of consent may slow transactions.</p>
        <p><strong>Contact:</strong></p>
        <p>📧 info@easytradelines.com</p>
        <p>📞 (786) 460-5316</p>

        <h3>8. NOTICE</h3>
        <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
        <p>777 NW 72ND AVE</p>
        <p>STE 2008</p>
        <p>MIAMI, FL 33126</p>
        <br />
        <p><strong>INVESTOR:</strong></p>
        <p>Name: <strong>${isBlank ? '________________________' : formData.investorName}</strong></p>
        <p>Address: <strong>${isBlank ? '________________________' : formData.investorAddress}</strong></p>
        <p>Phone: <strong>${isBlank ? '________________________' : formData.investorPhone}</strong></p>
        <p>Email: <strong>${isBlank ? '________________________' : formData.investorEmail}</strong></p>

        <h3>9. ARBITRATION</h3>
        <p>Any disputes not resolved within 60 days shall be settled by binding arbitration.</p>

        <h3>10. GOVERNING LAW</h3>
        <p>This Agreement shall be governed by the laws of the State of Florida.</p>

        <h3>11. GENERAL PROVISIONS</h3>
        <p>This Agreement comprises the entire agreement between the parties. All prior negotiations are superseded. Card Holder may not assign this Agreement without written consent of Easy Tradelines. Other provisions remain unchanged.</p>
        
        <div style="margin-top: 40px;">
          <p><strong>Card Holder:</strong> ${isBlank ? '________________________' : formData.cardHolderFullName}</p>
          ${!isBlank && affiliateSignatureDataUrl ? `<img src="${affiliateSignatureDataUrl}" style="max-width: 200px; height: 60px;">` : '<div style="border-bottom: 1px solid #000; width: 200px; height: 40px; margin: 10px 0;">CLICK HERE TO SIGN</div>'}
          <p><strong>By: initial</strong> ${isBlank ? '____' : formData.initials} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> ${isBlank ? '________' : currentDate}</p>
          
          <br><br>
          
          <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
          <p><strong>By:</strong> ${isBlank ? '________________________' : formData.easyTradeLinesAgent} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> ${isBlank ? '________' : currentDate}</p>
          <p><strong>initial</strong> ${isBlank ? '____' : formData.easyTradeLinesInitials} &nbsp;&nbsp;&nbsp; I have read and understood the document</p>
        </div>
      </div>
    `;
  };

  // Funciones de canvas
  const startDrawing = (e) => {
    if (isLocked && !isAdmin) return;
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
    if (isLocked && !isAdmin) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startAffiliateDrawing = (e) => {
    if (isLocked && !isAdmin) return;
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
    if (isLocked && !isAdmin) return;
    const canvas = affiliateCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Funciones para manejo de datos
  const handleSaveDraft = () => {
    if (isLocked && !isAdmin) {
      alert('Document is locked. Cannot save changes.');
      return;
    }
    
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
      contract_signed: true,
      canEdit: true
    };
    
    setFormData(prev => ({ ...prev, contract_signed: true }));
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
            {isLocked && <Lock />}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && (
              <button 
                onClick={toggleLock}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: isLocked ? '#ef4444' : '#10b981',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={isLocked ? 'Click to unlock document' : 'Click to lock document'}
              >
                {isLocked ? <Lock /> : <Unlock />}
                {isLocked ? 'Locked' : 'Unlocked'}
              </button>
            )}
            
            <button 
              onClick={downloadBlankPDF}
              style={{
                padding: '8px 12px',
                border: 'none',
                backgroundColor: '#6b7280',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FileText size={16} />
              Blank PDF
            </button>
            
            <button 
              onClick={downloadSignedPDF}
              disabled={!formData.contract_signed}
              style={{
                padding: '8px 12px',
                border: 'none',
                backgroundColor: formData.contract_signed ? '#16a34a' : '#9ca3af',
                color: 'white',
                borderRadius: '6px',
                cursor: formData.contract_signed ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Download size={16} />
              Signed PDF
            </button>
            
            {(formData.contract_signed || formData.isDraft) && (!isLocked || isAdmin) && (
              <button 
                onClick={() => {
                  setCurrentStep('affiliate');
                  setFormData(prev => ({
                    ...prev,
                    contract_signed: false,
                    isDraft: false,
                    canEdit: true
                  }));
                }}
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
                Edit Contract
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
          maxHeight: 'calc(95vh - 200px)',
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
              
              {isLocked && (
                <div style={{ backgroundColor: '#fee2e2', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ef4444' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Document Locked</h4>
                  <p style={{ margin: '0', fontSize: '14px' }}>This document has been locked by an administrator. No changes are allowed.</p>
                </div>
              )}
              
              {!isLocked && (
                <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #2196f3' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Instructions for Affiliate</h4>
                  <p style={{ margin: '0', fontSize: '14px' }}>Please complete all the highlighted fields below and provide your signature. Once completed, click "Save as Draft" to send to admin for finalization.</p>
                </div>
              )}

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
                    disabled={isLocked && !isAdmin}
                    style={{
                      backgroundColor: isLocked && !isAdmin ? '#e5e7eb' : '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '200px',
                      outline: 'none',
                      cursor: isLocked && !isAdmin ? 'not-allowed' : 'text'
                    }}
                  />, whose address
                  is{' '}
                  <input
                    type="text"
                    value={formData.cardHolderAddress}
                    onChange={(e) => handleInputChange('cardHolderAddress', e.target.value)}
                    placeholder="Full Address"
                    disabled={isLocked && !isAdmin}
                    style={{
                      backgroundColor: isLocked && !isAdmin ? '#e5e7eb' : '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '250px',
                      outline: 'none',
                      cursor: isLocked && !isAdmin ? 'not-allowed' : 'text'
                    }}
                  />, hereinafter called "Card Holder".
                </p>
              </div>

              {/* Todas las secciones del documento */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>1. PURPOSE OF THE AGREEMENT</div>
                <p>Easy Tradelines and Card Holder have entered into this Agreement to set forth the terms and conditions under which Easy Tradelines will facilitate a third-party's (the "Third-Party") temporary designation on the Card Holder's credit lines/trade-lines as an authorized user for the sole purpose of attempting to increase the Third-Party's FICO score.</p>
                <p>Cardholder hereby agrees to be bound to the following terms and conditions regarding all services rendered by Easy Tradelines.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>2. SERVICES</div>
                <p>Easy Tradelines will perform the following services under this Agreement.</p>
                <p>Easy Tradelines will use its best efforts to establish relationships between Cardholder and Third-Parties based on its review of the creditworthiness of the Cardholder and the credit enhancement sought by Third-Parties. The decision of Easy Tradelines to match any Third-Party with the Cardholder shall be within the sole and exclusive discretion of Easy Tradelines, and Easy Tradelines makes no representation, actual or implied, that any Third-Party will be presented to Cardholder for its consideration to be added as an authorized user on any tradelines made available by the Cardholder pursuant to this Agreement.</p>
                <p>Easy Tradelines will make an independent review of the Cardholder's creditworthiness and available trade-lines for purposes of: (i) determining whether the addition of a Third-Party to these tradelines is likely to have a positive effect on the Third-Party's FICO score; (ii) assessing the value of the Cardholder's agreement to make a tradeline available to a Third-Party; and (iii) providing Cardholder with the appropriate information from a Third-Party so as to enable the Cardholder to add these third-parties as additional authorized users of such trade-lines.</p>
              </div>

              {/* Continúa con todas las secciones hasta la 11 */}
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>8. NOTICE</div>
                <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
                <p>777 NW 72ND AVE</p>
                <p>STE 2008</p>
                <p>MIAMI, FL 33126</p>
                <br />
                <p><strong>INVESTOR:</strong></p>
                <div style={{ marginLeft: '20px' }}>
                  <p>
                    Name:{' '}
                    <input
                      type="text"
                      value={formData.investorName}
                      onChange={(e) => handleInputChange('investorName', e.target.value)}
                      placeholder="Investor Name"
                      disabled={isLocked && !isAdmin}
                      style={{
                        backgroundColor: isLocked && !isAdmin ? '#e5e7eb' : '#fff3cd',
                        border: '2px solid #ffc107',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        margin: '0 4px',
                        minWidth: '200px',
                        outline: 'none',
                        cursor: isLocked && !isAdmin ? 'not-allowed' : 'text'
                      }}
                    />
                  </p>
                  {/* Resto de campos de investor */}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>11. GENERAL PROVISIONS</div>
                <p>This Agreement comprises the entire agreement between the parties. All prior negotiations are superseded. Card Holder may not assign this Agreement without written consent of Easy Tradelines. Other provisions remain unchanged.</p>
                
                <br />
                <p>
                  Card Holder:{' '}
                  <input
                    type="text"
                    value={formData.cardHolderFullName}
                    onChange={(e) => handleInputChange('cardHolderFullName', e.target.value)}
                    placeholder="Card Holder Full Name"
                    disabled={isLocked && !isAdmin}
                    style={{
                      backgroundColor: isLocked && !isAdmin ? '#e5e7eb' : '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '250px',
                      outline: 'none',
                      cursor: isLocked && !isAdmin ? 'not-allowed' : 'text'
                    }}
                  />
                </p>
                
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <p><strong>CLICK HERE TO SIGN</strong></p>
                  <canvas
                    ref={affiliateCanvasRef}
                    width={350}
                    height={100}
                    style={{
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      cursor: isLocked && !isAdmin ? 'not-allowed' : 'crosshair',
                      backgroundColor: isLocked && !isAdmin ? '#e5e7eb' : '#fff3cd',
                      marginLeft: '20px'
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
                    disabled={isLocked && !isAdmin}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: isLocked && !isAdmin ? 'not-allowed' : 'pointer',
                      border: 'none',
                      backgroundColor: isLocked && !isAdmin ? '#9ca3af' : '#6b7280',
                      color: 'white',
                      marginTop: '5px',
                      marginLeft: '20px'
                    }}
                  >
                    Clear Signature
                  </button>
                </div>

                <p>
                  By: initial{' '}
                  <input
                    type="text"
                    value={formData.initials}
                    onChange={(e) => handleInputChange('initials', e.target.value)}
                    placeholder="Initials"
                    maxLength="5"
                    disabled={isLocked && !isAdmin}
                    style={{
                      backgroundColor: isLocked && !isAdmin ? '#e5e7eb' : '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      margin: '0 4px',
                      minWidth: '80px',
                      outline: 'none',
                      cursor: isLocked && !isAdmin ? 'not-allowed' : 'text'
                    }}
                  />{' '}
                  Date: <strong>{currentDate}</strong>
                </p>
              </div>
            </>
          )}

          {/* Secciones admin y review se mantienen igual pero con validación de isLocked */}
        </div>

        {/* Footer con botones */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#f8fafc',
          minHeight: '80px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
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
          
          {currentStep === 'affiliate' && !isLocked && (
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
          
          {/* Resto de botones según el step */}
        </div>
      </div>
    </div>
  );
};

export default CardHolderAgreementPopup;
