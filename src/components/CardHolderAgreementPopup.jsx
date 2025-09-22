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
    contract_signed: false,
    canEdit: true
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

  // Funciones de canvas
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

  // Funciones para manejo de datos
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
      contract_signed: true,
      canEdit: true
    };
    
    setFormData(prev => ({ ...prev, contract_signed: true }));
    onSignComplete({ contractData });
  };

  const generatePDF = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; font-size: 18px; margin-bottom: 30px;">CARD HOLDER AGREEMENT</h1>
        
        <p>This Agreement is entered into on the <strong>${new Date().getDate()}</strong> day of <strong>${new Date().toLocaleDateString('en-US', { month: 'long' })}</strong>, <strong>${new Date().getFullYear()}</strong>, by and between Smart Latinos Consulting Group, doing business as Easy Tradelines, herein after referred to as "Easy Tradelines", and <strong>${formData.cardHolderName}</strong>, whose address is <strong>${formData.cardHolderAddress}</strong>, hereinafter called "Card Holder".</p>

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
        
        <p>Cardholder acknowledges that all information provided to it by Easy Tradelines with respect to a Third-Party is confidential, and Cardholder agrees that it shall keep all such information confidential by taking appropriate measures to ensure against the unauthorized release or reproduction of or access to the information and to destroy or return to Easy Tradelines such information as soon as practicable after the Third-Party has been added as an additional authorized user of the applicable tradeline. In the event that Cardholder receives any request for information provided to it by Easy Tradelines by means of a subpoena or other valid legal process, the Cardholder shall not provide any such information without and until it has notified Easy Tradelines of the request in writing at least five (5) business days before responding to such request by providing the information.</p>
        
        <p>Cardholder shall promptly notify Easy Tradelines of any material change in its name or contact information, including, but not limited to, any change in telephone numbers, mail addresses, or email addresses.</p>
        
        <p>Cardholder shall promptly notify Easy Tradelines of any material change to its tradelines, including, but not limited to, any changes in payment due dates, credit limits, or outstanding balances on these trade-lines. In addition, Cardholder shall promptly notify Easy Tradelines of any event of default, or other event, that if not cured within the terms and conditions of any trade-line, would constitute an event of default under any trade-line.</p>
        
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
        <p>Name: <strong>${formData.investorName}</strong></p>
        <p>Address: <strong>${formData.investorAddress}</strong></p>
        <p>Phone: <strong>${formData.investorPhone}</strong></p>
        <p>Email: <strong>${formData.investorEmail}</strong></p>

        <h3>9. ARBITRATION</h3>
        <p>Any disputes not resolved within 60 days shall be settled by binding arbitration.</p>

        <h3>10. GOVERNING LAW</h3>
        <p>This Agreement shall be governed by the laws of the State of Florida.</p>

        <h3>11. GENERAL PROVISIONS</h3>
        <p>This Agreement comprises the entire agreement between the parties. All prior negotiations are superseded. Card Holder may not assign this Agreement without written consent of Easy Tradelines. Other provisions remain unchanged.</p>
        
        <div style="margin-top: 40px;">
          <p><strong>Card Holder:</strong> ${formData.cardHolderFullName}</p>
          <p><strong>Card Holder Signature:</strong> [Signed Electronically]</p>
          <p><strong>By: initial</strong> ${formData.initials} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> ${currentDate}</p>
          
          <br><br>
          
          <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
          <p><strong>By:</strong> ${formData.easyTradeLinesAgent} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> ${currentDate}</p>
          <p><strong>initial</strong> ${formData.easyTradeLinesInitials} &nbsp;&nbsp;&nbsp; I have read and understood the document</p>
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
            
            {formData.contract_signed && (
              <button 
                onClick={() => {
                  setCurrentStep('affiliate');
                  setFormData(prev => ({
                    ...prev,
                    contract_signed: false,
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

              {/* TEXTO COMPLETO DEL PDF - TODAS LAS SECCIONES */}
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

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>3. COVENANTS, REPRESENTATIONS, AND WARRANTIES</div>
                <p><strong>Easy Tradeline Card Holders covenants, represents and warrants the following:</strong></p>
                
                <p>Cardholder shall provide all information requested by Easy Tradelines and that all such information is true, complete and correct in all respects.</p>
                
                <p>Cardholder authorizes Easy Tradelines to obtain from Equifax, Experian, and TransUnion, or any their respective affiliates (together, the "Credit Bureaus"), and, if necessary, from their respective subscribers, all credit and transaction information regarding Cardholder's credit history, credit transactions of record, and credit scores. This information may include, but is not necessarily limited to, review of credit reports, credit history, credit files, credit transactions and any other credit-related record.</p>
                
                <p>Cardholder represents, warrants and agrees that he/she shall not attempt to contact nor have any direct contact with any Third-Party. If Cardholder is contacted directly by any Third-Party, Cardholder shall not communicate with the Third-Party and shall immediately contact Easy Tradelines advising them of the contact.</p>
                
                <p>Cardholder acknowledges that all information provided to it by Easy Tradelines with respect to a Third-Party is confidential, and Cardholder agrees that it shall keep all such information confidential by taking appropriate measures to ensure against the unauthorized release or reproduction of or access to the information and to destroy or return to Easy Tradelines such information as soon as practicable after the Third-Party has been added as an additional authorized user of the applicable tradeline. In the event that Cardholder receives any request for information provided to it by Easy Tradelines by means of a subpoena or other valid legal process, the Cardholder shall not provide any such information without and until it has notified Easy Tradelines of the request in writing at least five (5) business days before responding to such request by providing the information.</p>
                
                <p>Cardholder shall promptly notify Easy Tradelines of any material change in its name or contact information, including, but not limited to, any change in telephone numbers, mail addresses, or email addresses.</p>
                
                <p>Cardholder shall promptly notify Easy Tradelines of any material change to its tradelines, including, but not limited to, any changes in payment due dates, credit limits, or outstanding balances on these trade-lines. In addition, Cardholder shall promptly notify Easy Tradelines of any event of default, or other event, that if not cured within the terms and conditions of any trade-line, would constitute an event of default under any trade-line.</p>
                
                <p>For so long as any Third-Party is an authorized user of any tradeline, Cardholder agrees that it will maintain an outstanding balance on the tradeline that is less than 10% of the maximum credit made available by the lender under such tradeline, and that it will make timely payment in accordance with the terms and conditions of the tradeline.</p>
                
                <p>Cardholder shall add a Third-Party as an authorized user to the applicable tradeline within 48 hours of receiving all information from Easy Tradelines. Unless a different time period is requested by Easy Tradelines, Cardholder agrees to keep Third-Party as an authorized user on its tradeline for a minimum of one-billing cycle or thirty (30) days.</p>
                
                <p>Cardholder shall not provide a Third-Party with the ability to access the trade-line in any manner, including, but not limited to, by providing a check, credit card, an account number, or any authorization code.</p>
                
                <p>For so long as this Agreement is in effect, Cardholder shall not enter into any agreement authorizing the use of the tradeline by any party other than a Third-Party without obtaining the prior written consent of Easy Tradelines.</p>
                
                <p>Cardholder shall rely solely on the information provided by Easy Tradelines in authorizing a Third-Party as an additional user of the tradeline, and shall not undertake any independent review of or make any request for information regarding the Third-Party, without obtaining the prior written consent of Easy Tradelines.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>3.2 Easy Tradelines' Covenants, Representations, and Warranties</div>
                <p><strong>Easy Tradelines covenants, represents and warrants the following:</strong></p>
                
                <p>Easy Tradelines shall be solely responsible for obtaining and assessing information from prospective Third-Parties referred to the Cardholder.</p>
                
                <p>Prior to its agreement to add a Third-Party as an authorized user of a tradeline, the Cardholder will be notified by Easy Tradelines of the fee it will receive in exchange for Cardholder's agreement to add a Third-Party as an authorized user on the tradeline.</p>
                
                <p>Easy Tradelines shall not provide a Third-Party with the ability to access a Cardholder's tradeline in any manner, including, but not limited to, by providing any credit card numbers, account numbers, or any authorization code(s).</p>
                
                <p>Easy Tradelines is not a credit repair company in that it does not attempt to correct inaccurate information on behalf of the Third-Party, does not submit or attempt to resolve disputes on behalf of the Client, and does not attempt to improve a client's credit record or history.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>4. COMPENSATION</div>
                <p>In exchange for Cardholder's agreement to add a Third-Party as an authorized user of any trade-line, Cardholder shall receive a fee in an amount to be determined by Easy Tradelines. The fee paid by Easy Tradelines shall be determined by Easy Tradelines in its sole discretion after its assessment of relevant factors, including, without limitation, the Cardholder's creditworthiness, the status of the tradeline, and the potential value of any improvement in a Third-Party's credit scores as a result of being added as an authorized user on the Cardholder's tradeline.</p>
                
                <p><strong>4.2</strong> No fee shall be paid to the Cardholder for its agreement to add a Third-Party to a tradeline until and unless the addition of the Third-Party as an authorized user of the Cardholder's trade-line has been reflected on the credit report of the Third-Party issued by Equifax, Experian, and Trans Union.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>5. TIME FOR PERFORMANCE OF SERVICES</div>
                <p>Following the execution of this Agreement by the parties, Easy Tradelines shall begin using its best efforts to identify Third-Parties who would benefit from being added as an authorized user on the Cardholder's tradeline.</p>
                
                <p>This Agreement shall continue until such time as it is terminated by either party. Either party may terminate this Agreement by providing not less than thirty (30) days written notice to the other, provided however, if a Third-Party is an authorized user of a trade-line at the time the Cardholder gives notice of its intent to terminate, the Agreement shall not terminate with respect to any such Third-Party until and unless the addition of such Third-Party as an authorized user of the Cardholder's tradeline has been reflected on the credit report of the Third-Party issued by Equifax, Experian, and Trans Union.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>6. LIMITATION OF LIABILITY</div>
                <p>The total liability of Easy Tradelines shall not exceed the total amount of fees paid by the Third-Party. Card Holder assumes all risk that lenders may cancel, reduce, or terminate trade-lines.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>7. ELECTRONIC CONSENT</div>
                <p>Card Holder consents to receive and send communications electronically with Easy Tradelines. Withdrawal of consent may slow transactions.</p>
                <p><strong>Contact:</strong></p>
                <p>📧 info@easytradelines.com</p>
                <p>📞 (786) 460-5316</p>
              </div>

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
                <p>Any disputes not resolved within 60 days shall be settled by binding arbitration.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>10. GOVERNING LAW</div>
                <p>This Agreement shall be governed by the laws of the State of Florida.</p>
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
                
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <p><strong>CLICK HERE TO SIGN</strong></p>
                  <canvas
                    ref={affiliateCanvasRef}
                    width={350}
                    height={100}
                    style={{
                      border: '2px solid #ffc107',
                      borderRadius: '4px',
                      cursor: 'crosshair',
                      backgroundColor: '#fff3cd',
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
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#6b7280',
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
                <p style={{ margin: '0', fontSize: '14px' }}>Complete the EasyTradelines representative information below. The admin fills the final section with agent name, date (automatic), and initials.</p>
              </div>

              {/* Mostrar datos del affiliate completados */}
              <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4>Affiliate Information (Completed)</h4>
                <p><strong>Card Holder:</strong> {formData.cardHolderName}</p>
                <p><strong>Address:</strong> {formData.cardHolderAddress}</p>
                <p><strong>Investor Name:</strong> {formData.investorName}</p>
                <p><strong>Investor Address:</strong> {formData.investorAddress}</p>
                <p><strong>Phone:</strong> {formData.investorPhone}</p>
                <p><strong>Email:</strong> {formData.investorEmail}</p>
                <p><strong>Card Holder Full Name:</strong> {formData.cardHolderFullName}</p>
                <p><strong>Initials:</strong> {formData.initials}</p>
                <p style={{ color: '#4caf50', fontWeight: '500' }}>✓ Affiliate signature completed</p>
              </div>

              {/* Sección SOLO para Admin - Campos específicos requeridos */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '16px' }}>EASY TRADELINES COMPLETION SECTION</div>
                
                <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', border: '2px solid #ffc107' }}>
                  <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>
                      Agent Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.easyTradeLinesAgent}
                      onChange={(e) => handleInputChange('easyTradeLinesAgent', e.target.value)}
                      placeholder="Enter EasyTradelines agent name"
                      style={{
                        backgroundColor: 'white',
                        border: '2px solid #ffc107',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        width: '100%',
                        maxWidth: '300px',
                        outline: 'none',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>
                      Agent Initials <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.easyTradeLinesInitials}
                      onChange={(e) => handleInputChange('easyTradeLinesInitials', e.target.value)}
                      placeholder="Agent initials"
                      maxLength="5"
                      style={{
                        backgroundColor: 'white',
                        border: '2px solid #ffc107',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        width: '100px',
                        outline: 'none',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '12px', color: '#8b5a00', marginTop: '10px' }}>
                    These fields will complete the final signature section of the contract.
                  </p>
                </div>
              </div>

              {/* Vista previa de cómo aparecerá en el contrato final */}
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Final Contract Preview</h4>
                <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>
                  <p>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</p>
                  <p>By: <strong>{formData.easyTradeLinesAgent || '_____________________'}</strong> &nbsp;&nbsp;&nbsp; Date: <strong>{currentDate}</strong></p>
                  <p>initial <strong>{formData.easyTradeLinesInitials || '____'}</strong> &nbsp;&nbsp;&nbsp; I have read and understood the document</p>
                </div>
              </div>
            </>
          )}

          {currentStep === 'review' && (
            <>
              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                COMPLETE CARD HOLDER AGREEMENT
              </div>

              {/* Documento completo para revisión con TEXTO EXACTO del PDF */}
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

              {/* Todas las secciones del contrato */}
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

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>3. COVENANTS, REPRESENTATIONS, AND WARRANTIES</div>
                <p><strong>Easy Tradeline Card Holders covenants, represents and warrants the following:</strong></p>
                <p>Cardholder shall provide all information requested by Easy Tradelines and that all such information is true, complete and correct in all respects.</p>
                <p>Cardholder authorizes Easy Tradelines to obtain from Equifax, Experian, and TransUnion, or any their respective affiliates (together, the "Credit Bureaus"), and, if necessary, from their respective subscribers, all credit and transaction information regarding Cardholder's credit history, credit transactions of record, and credit scores.</p>
                <p>Cardholder represents, warrants and agrees that he/she shall not attempt to contact nor have any direct contact with any Third-Party.</p>
                <p>Cardholder acknowledges that all information provided to it by Easy Tradelines with respect to a Third-Party is confidential.</p>
                <p>Cardholder shall promptly notify Easy Tradelines of any material change in its name or contact information.</p>
                <p>Cardholder shall promptly notify Easy Tradelines of any material change to its tradelines.</p>
                <p>For so long as any Third-Party is an authorized user of any tradeline, Cardholder agrees that it will maintain an outstanding balance on the tradeline that is less than 10% of the maximum credit made available.</p>
                <p>Cardholder shall add a Third-Party as an authorized user to the applicable tradeline within 48 hours of receiving all information from Easy Tradelines.</p>
                <p>Cardholder shall not provide a Third-Party with the ability to access the trade-line in any manner.</p>
                <p>For so long as this Agreement is in effect, Cardholder shall not enter into any agreement authorizing the use of the tradeline by any party other than a Third-Party without obtaining the prior written consent of Easy Tradelines.</p>
                <p>Cardholder shall rely solely on the information provided by Easy Tradelines in authorizing a Third-Party as an additional user of the tradeline.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>3.2 Easy Tradelines' Covenants, Representations, and Warranties</div>
                <p><strong>Easy Tradelines covenants, represents and warrants the following:</strong></p>
                <p>Easy Tradelines shall be solely responsible for obtaining and assessing information from prospective Third-Parties referred to the Cardholder.</p>
                <p>Prior to its agreement to add a Third-Party as an authorized user of a tradeline, the Cardholder will be notified by Easy Tradelines of the fee it will receive.</p>
                <p>Easy Tradelines shall not provide a Third-Party with the ability to access a Cardholder's tradeline in any manner.</p>
                <p>Easy Tradelines is not a credit repair company in that it does not attempt to correct inaccurate information on behalf of the Third-Party.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>4. COMPENSATION</div>
                <p>In exchange for Cardholder's agreement to add a Third-Party as an authorized user of any trade-line, Cardholder shall receive a fee in an amount to be determined by Easy Tradelines.</p>
                <p><strong>4.2</strong> No fee shall be paid to the Cardholder for its agreement to add a Third-Party to a tradeline until and unless the addition of the Third-Party as an authorized user has been reflected on the credit report.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>5. TIME FOR PERFORMANCE OF SERVICES</div>
                <p>Following the execution of this Agreement by the parties, Easy Tradelines shall begin using its best efforts to identify Third-Parties who would benefit from being added as an authorized user on the Cardholder's tradeline.</p>
                <p>This Agreement shall continue until such time as it is terminated by either party. Either party may terminate this Agreement by providing not less than thirty (30) days written notice to the other.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>6. LIMITATION OF LIABILITY</div>
                <p>The total liability of Easy Tradelines shall not exceed the total amount of fees paid by the Third-Party. Card Holder assumes all risk that lenders may cancel, reduce, or terminate trade-lines.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>7. ELECTRONIC CONSENT</div>
                <p>Card Holder consents to receive and send communications electronically with Easy Tradelines. Withdrawal of consent may slow transactions.</p>
                <p><strong>Contact:</strong></p>
                <p>📧 info@easytradelines.com</p>
                <p>📞 (786) 460-5316</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>8. NOTICE</div>
                <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
                <p>777 NW 72ND AVE, STE 2008, MIAMI, FL 33126</p>
                <br />
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
                <p>Any disputes not resolved within 60 days shall be settled by binding arbitration.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>10. GOVERNING LAW</div>
                <p>This Agreement shall be governed by the laws of the State of Florida.</p>
              </div>

              {/* Sección 11 con campos editables para admin */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>11. GENERAL PROVISIONS</div>
                <p>This Agreement comprises the entire agreement between the parties. All prior negotiations are superseded. Card Holder may not assign this Agreement without written consent of Easy Tradelines. Other provisions remain unchanged.</p>
                
                <div style={{ marginTop: '30px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <p><strong>Card Holder:</strong> {formData.cardHolderFullName}</p>
                  <p><strong>Card Holder Signature:</strong> ✓ Signed</p>
                  <p><strong>By: initial</strong> {formData.initials} &nbsp;&nbsp;&nbsp; <strong>Date:</strong> {currentDate}</p>
                  
                  <br />
                  
                  {/* Sección editable para admin en review */}
                  <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '6px', border: '2px solid #ffc107' }}>
                    <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span>By:</span>
                      <input
                        type="text"
                        value={formData.easyTradeLinesAgent}
                        onChange={(e) => handleInputChange('easyTradeLinesAgent', e.target.value)}
                        placeholder="Enter agent name"
                        style={{
                          backgroundColor: 'white',
                          border: '2px solid #ffc107',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          minWidth: '200px',
                          outline: 'none'
                        }}
                      />
                      <span>Date: <strong>{currentDate}</strong></span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span>initial</span>
                      <input
                        type="text"
                        value={formData.easyTradeLinesInitials}
                        onChange={(e) => handleInputChange('easyTradeLinesInitials', e.target.value)}
                        placeholder="Initials"
                        maxLength="5"
                        style={{
                          backgroundColor: 'white',
                          border: '2px solid #ffc107',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          width: '80px',
                          outline: 'none'
                        }}
                      />
                      <span>I have read and understood the document</span>
                    </div>
                  </div>
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
              <h3>Final Electronic Signature</h3>
              <p>Please provide final signature to complete the agreement:</p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Your Initials:
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
                  Final Signature:
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
                disabled={!formData.easyTradeLinesAgent || !formData.easyTradeLinesInitials}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: formData.easyTradeLinesAgent && formData.easyTradeLinesInitials ? 'pointer' : 'not-allowed',
                  border: 'none',
                  backgroundColor: formData.easyTradeLinesAgent && formData.easyTradeLinesInitials ? '#7c3aed' : '#9ca3af',
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
                disabled={!formData.easyTradeLinesAgent || !formData.easyTradeLinesInitials}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: formData.easyTradeLinesAgent && formData.easyTradeLinesInitials ? 'pointer' : 'not-allowed',
                  border: 'none',
                  backgroundColor: formData.easyTradeLinesAgent && formData.easyTradeLinesInitials ? '#16a34a' : '#9ca3af',
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
