import React, { useState, useRef } from 'react';
import { X, FileText, Download, Check } from 'lucide-react';

const CardHolderAgreementPopup = ({ isOpen, onClose, affiliateData = {}, onSignComplete }) => {
  const [agreementData, setAgreementData] = useState({
    cardHolderName: `${affiliateData.first_name || ''} ${affiliateData.last_name || ''}`.trim(),
    cardHolderAddress: '',
    investorName: `${affiliateData.first_name || ''} ${affiliateData.last_name || ''}`.trim(),
    investorAddress: '',
    investorPhone: affiliateData.phone || '',
    investorEmail: affiliateData.email || '',
    cardHolderSignature: '',
    easyTradeLinesSignature: 'Jose Hefferan',
    signatureDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }),
    day: new Date().getDate(),
    month: new Date().toLocaleDateString('en-US', { month: 'long' }),
    year: new Date().getFullYear(),
    signature: '',
    initials: ''
  });

  const [currentStep, setCurrentStep] = useState('review'); // 'review' or 'sign'
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleInputChange = (field, value) => {
    setAgreementData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
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
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = () => {
    const canvas = signatureCanvasRef.current;
    const signatureDataUrl = canvas.toDataURL();
    
    const contractData = {
      ...agreementData,
      signature_data: signatureDataUrl,
      signature_date: new Date().toISOString(),
      contract_signed: true
    };

    onSignComplete({ contractData });
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
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
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '95vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f8fafc'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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
      padding: '24px',
      maxHeight: 'calc(95vh - 160px)',
      overflowY: 'auto',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#374151'
    },
    agreementTitle: {
      textAlign: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textDecoration: 'underline'
    },
    editableField: {
      display: 'inline-block',
      minWidth: '200px',
      padding: '4px 8px',
      margin: '0 4px',
      backgroundColor: '#fff3cd !important',
      border: '2px solid #ffc107 !important',
      borderRadius: '4px',
      verticalAlign: 'baseline'
    },
    editableInput: {
      border: 'none',
      background: 'transparent',
      fontSize: 'inherit',
      width: '100%',
      outline: 'none',
      color: '#000000',
      fontWeight: '500'
    },
    section: {
      marginBottom: '20px'
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    signatureSection: {
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    signatureCanvas: {
      border: '2px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'crosshair',
      backgroundColor: 'white'
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      backgroundColor: '#f8fafc'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s'
    },
    cancelButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    primaryButton: {
      backgroundColor: '#16a34a',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <FileText size={24} />
            Card Holder Agreement
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {currentStep === 'review' && (
            <>
              <div style={styles.agreementTitle}>CARD HOLDER AGREEMENT</div>
              
              <div style={styles.section}>
                <p>
                  This Agreement is entered into on the{' '}
                  <strong>{agreementData.day}</strong> day of{' '}
                  <strong>{agreementData.month}</strong>, <strong>{agreementData.year}</strong>, by and between
                  Smart Latinos Consulting Group, doing business as Easy Tradelines, herein after
                  referred to as "Easy Tradelines", and{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.cardHolderName}
                      onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Card Holder Name"
                    />
                  </span>, whose address
                  is{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.cardHolderAddress}
                      onChange={(e) => handleInputChange('cardHolderAddress', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Full Address"
                    />
                  </span>, hereinafter called "Card Holder".
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>1. PURPOSE OF THE AGREEMENT</div>
                <p>
                  Easy Tradelines and Card Holder have entered into this Agreement to set forth the
                  terms and conditions under which Easy Tradelines will facilitate a third-party's (the
                  "Third-Party") temporary designation on the Card Holder´s credit lines/trade-lines as an
                  authorized user for the sole purpose of attempting to increase the Third-Party's FICO
                  score.
                </p>
                <p>
                  Cardholder hereby agrees to be bound to the following terms and conditions regarding
                  all services rendered by Easy Tradelines.
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>2. SERVICES</div>
                <p>Easy Tradelines will perform the following services under this Agreement.</p>
                <p>
                  Easy Tradelines will use its best efforts to establish relationships between Cardholder and
                  Third-Parties based on its review of the creditworthiness of the Cardholder and the credit
                  enhancement sought by Third-Parties. The decision of Tradeline Score to match any
                  Third-Party with the Cardholder shall be within the sole and exclusive discretion of Easy
                  Tradelines, and Easy Tradelines makes no representation, actual or implied, that any
                  Third-Party will be presented to Cardholder for its consideration to be added as an authorized
                  user on any tradelines made available by the Cardholder pursuant to this Agreement.
                </p>
                <p>
                  Easy Tradelines will make an independent review of the Cardholder's creditworthiness
                  and available trade-lines for purposes of: (i) determining whether the addition of a
                  Third-Party to these tradelines is likely to have a positive effect on the Third-Party's
                  FICO score; (ii) assessing the value of the Cardholder's agreement to make a tradeline
                  available to a Third-Party; and (iii) providing Cardholder with the appropriate information
                  from a Third-Party so as to enable the Cardholder to add these third-parties as
                  additional authorized users of such trade-lines.
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>3. COVENANTS, REPRESENTATIONS, AND WARRANTIES</div>
                <p>Easy Tradeline Card Holders covenants, represents and warrants the following:</p>
                <p>
                  Cardholder shall provide all information requested by Easy Tradelines and that all such
                  information is true, complete and correct in all respects.
                </p>
                <p>
                  Cardholder authorizes Easy Tradelines to obtain from Equifax, Experian, and
                  TransUnion, or any their respective affiliates (together, the "Credit Bureaus"), and, if
                  necessary, from their respective subscribers, all credit and transaction information
                  regarding Cardholder's credit history, credit transactions of record, and credit scores.
                  This information may include, but is not necessarily limited to, review of credit reports,
                  credit history, credit files, credit transactions and any other credit-related record.
                </p>
                <p>
                  Cardholder represents, warrants and agrees that he/she shall not attempt to contact nor
                  have any direct contact with any Third-Party. If Cardholder is contacted directly by any
                  Third-Party, Cardholder shall not communicate with the Third-Party and shall
                  immediately contact Easy Tradelines advising them of the contact.
                </p>
                <p>
                  Cardholder acknowledges that all information provided to it by Easy Tradelines with
                  respect to a Third-Party is confidential, and Cardholder agrees that it shall keep all such
                  information confidential by taking appropriate measures to ensure against the
                  unauthorized release or reproduction of or access to the information and to destroy or
                  return to Easy Tradelines such information as soon as practicable after the Third-Party
                  has been added as an additional authorized user of the applicable tradeline. In the
                  event that Cardholder receives any request for information provided to it by Easy
                  Tradelines by means of a subpoena or other valid legal process, the Cardholder shall
                  not provide any such information without and until it has notified easy Tradelines of the
                  request in writing at least five (5) business days before responding to such request by
                  providing the information.
                </p>
                <p>
                  Cardholder shall promptly notify Easy Tradelines of any material change in its name or
                  contact information, including, but not limited to, any change in telephone numbers, mail
                  addresses, or email addresses.
                </p>
                <p>
                  Cardholder shall promptly notify Easy Tradelines of any material change to its
                  tradelines, including, but not limited to, any changes in payment due dates, credit limits,
                  or outstanding balances on these trade-lines. In addition, Cardholder shall promptly
                  notify Tradeline Score of any event of default, or other event, that if not cured within the
                  terms and conditions of any trade-line, would constitute an event of default under any
                  trade-line.
                </p>
                <p>
                  For so long as any Third-Party is an authorized user of any tradeline, Cardholder
                  agrees that it will maintain an outstanding balance on the tradeline that is less than 10%
                  of the maximum credit made available by the lender under such tradeline, and that it will
                  make timely payment in accordance with the terms and conditions of the tradeline.
                </p>
                <p>
                  Cardholder shall add a Third-Party as an authorized user to the applicable tradeline
                  within 48 hours of receiving all information from Tradeline Score. Unless a different time
                  period is requested by Easy Tradelines, Cardholder agrees to keep Third-Party as an
                  authorized user on its tradeline for a minimum of one-billing cycle or thirty (30) days.
                </p>
                <p>
                  Cardholder shall not provide a Third-Party with the ability to access the trade-line in any
                  manner, including, but not limited to, by providing a check, credit card, an account
                  number, or any authorization code.
                </p>
                <p>
                  For so long as this Agreement is in effect, Cardholder shall not enter into any
                  agreement authorizing the use of the tradeline by any party other than a Third-Party
                  without obtaining the prior written consent of Easy Tradelines.
                </p>
                <p>
                  Cardholder shall rely solely on the information provided by Easy Tradelines in
                  authorizing a Third-Party as an additional user of the tradeline, and shall not undertake
                  any independent review of or make any request for information regarding the
                  Third-Party, without obtaining the prior written consent of Easy Tradelines.
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>3.2 Tradeline Score's Covenants, Representations, and Warranties.</div>
                <p>Easy Tradelines covenants, represents and warrants the following:</p>
                <p>
                  Easy Tradelines shall be solely responsible for obtaining and assessing information
                  from prospective Third-Parties referred to the Cardholder.
                </p>
                <p>
                  Prior to its agreement to add a Third-Party as an authorized user of a tradeline, the
                  Cardholder will be notified by Easy Tradelines of the fee it will receive in exchange for
                  Cardholder's agreement to add a Third-Party as an authorized user on the tradeline.
                </p>
                <p>
                  Easy Tradelines shall not provide a TS Third-Party with the ability to access a
                  Cardholder's tradeline in any manner, including, but not limited to, by providing any
                  credit card numbers, account numbers, or any authorization code(s).
                </p>
                <p>
                  Easy Tradelines is not a credit repair company in that it does not attempt to correct
                  inaccurate information on behalf of the Third-Party, does not submit or attempt to
                  resolve disputes on behalf of the Client, and does not attempt to improve a client's
                  credit record or history.
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>4. COMPENSATION</div>
                <p>
                  In exchange for Cardholder's agreement to add a Third-Party as an authorized user of
                  any trade-line, Cardholder shall receive a fee in an amount to be determined by Easy
                  Tradelines. The fee paid by Easy Tradelines shall be determined by Easy Tradelines in
                  its sole discretion after its assessment of relevant factors, including, without limitation,
                  the Cardholder's creditworthiness, the status of the tradeline, and the potential value of
                  any improvement in a Third-Party's credit scores as a result of being added as an
                  authorized user on the Cardholder's tradeline.
                </p>
                <p>
                  <strong>4.2</strong> No fee shall be paid to the Cardholder for its agreement to add a Third-Party to a
                  tradeline until and unless the addition of the Third-Party as an authorized user of the
                  Cardholder's trade-line has been reflected on the credit report of the Third-Party issued
                  by Equifax, Experian, and Trans Union.
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>5. TIME FOR PERFORMANCE OF SERVICES</div>
                <p>
                  Following the execution of this Agreement by the parties, Easy Tradelines shall begin
                  using its best efforts to identify Third-Parties who would benefit from being added as an
                  authorized user on the Cardholder's tradeline.
                </p>
                <p>
                  This Agreement shall continue until such time as it is terminated by either party. Either
                  party shall may terminate this Agreement by providing not less than thirty (30) days
                  written notice to the other, provided however, if a Third-Party is an authorized user of a
                  trade-line at the time the Cardholder gives notice of its intent to terminate, the
                  Agreement shall not terminate with respect to any such Third-Party until and unless the
                  addition of such Third-Party as an authorized user of the Cardholder's tradeline has
                  been reflected on the credit report of the Third-Party issued by Equifax, Experian, and
                  Trans Union.
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>6. LIMITATION OF LIABILITY</div>
                <p>
                  The total liability of Easy Tradelines shall not exceed the total amount of fees paid by
                  the Third-Party. Card Holder assumes all risk that lenders may cancel, reduce, or
                  terminate trade-lines.
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>7. ELECTRONIC CONSENT</div>
                <p>
                  Card Holder consents to receive and send communications electronically with Easy
                  Tradelines. Withdrawal of consent may slow transactions.
                </p>
                <p><strong>Contact:</strong></p>
                <p>📧 info@easytradelines.com</p>
                <p>📞 (786) 460-5316</p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>8. NOTICE</div>
                <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
                <p>777 NW 72ND AVE</p>
                <p>STE 2008</p>
                <p>MIAMI, FL 33126</p>
                <br />
                <p><strong>INVESTOR:</strong></p>
                <p>
                  Name:{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.investorName}
                      onChange={(e) => handleInputChange('investorName', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Investor Name"
                    />
                  </span>
                </p>
                <p>
                  Address:{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.investorAddress}
                      onChange={(e) => handleInputChange('investorAddress', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Full Address"
                    />
                  </span>
                </p>
                <p>
                  Phone:{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.investorPhone}
                      onChange={(e) => handleInputChange('investorPhone', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Phone Number"
                    />
                  </span>
                </p>
                <p>
                  Email:{' '}
                  <span style={styles.editableField}>
                    <input
                      type="email"
                      value={agreementData.investorEmail}
                      onChange={(e) => handleInputChange('investorEmail', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Email Address"
                    />
                  </span>
                </p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>9. ARBITRATION</div>
                <p>Any disputes not resolved within 60 days shall be settled by binding arbitration.</p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>10. GOVERNING LAW</div>
                <p>This Agreement shall be governed by the laws of the State of Florida.</p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>11. GENERAL PROVISIONS</div>
                <p>
                  This Agreement comprises the entire agreement between the parties. All prior
                  negotiations are superseded. Card Holder may not assign this Agreement without
                  written consent of Easy Tradelines. Other provisions remain unchanged.
                </p>
                <br />
                <p>
                  Card Holder:{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.cardHolderSignature}
                      onChange={(e) => handleInputChange('cardHolderSignature', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Card Holder Signature"
                    />
                  </span>
                </p>
                <br />
                <p>
                  By: initial{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.initials}
                      onChange={(e) => handleInputChange('initials', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Initials"
                      maxLength="5"
                    />
                  </span>{' '}
                  Date: <strong>{agreementData.signatureDate}</strong>
                </p>
                <br />
                <p><strong>EASY TRADELINES (Smart Latinos Consulting Group, DBA)</strong></p>
                <p>
                  By:{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.easyTradeLinesSignature}
                      onChange={(e) => handleInputChange('easyTradeLinesSignature', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Easy Tradelines Representative"
                    />
                  </span>{' '}
                  Date: <strong>{agreementData.signatureDate}</strong>
                </p>
                <br />
                <p>
                  initial{' '}
                  <span style={styles.editableField}>
                    <input
                      type="text"
                      value={agreementData.initials}
                      onChange={(e) => handleInputChange('initials', e.target.value)}
                      style={styles.editableInput}
                      placeholder="Initials"
                      maxLength="5"
                    />
                  </span>{' '}
                  I have read and understood the document
                </p>
              </div>
            </>
          )}

          {currentStep === 'sign' && (
            <div style={styles.signatureSection}>
              <h3>Electronic Signature</h3>
              <p>Please sign below to agree to the terms and conditions:</p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Initials:
                </label>
                <input
                  type="text"
                  value={agreementData.initials}
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
                  style={styles.signatureCanvas}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <button
                  onClick={clearSignature}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    marginTop: '8px'
                  }}
                >
                  Clear Signature
                </button>
              </div>

              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                Date: {agreementData.signatureDate}
              </p>
              
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '16px' }}>
                ☑️ I have read and understood the document
              </p>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{...styles.button, ...styles.cancelButton}}
          >
            Cancel
          </button>
          
          {currentStep === 'review' && (
            <button
              onClick={() => setCurrentStep('sign')}
              style={{...styles.button, ...styles.primaryButton}}
            >
              Proceed to Sign
            </button>
          )}
          
          {currentStep === 'sign' && (
            <>
              <button
                onClick={() => setCurrentStep('review')}
                style={{...styles.button, ...styles.secondaryButton}}
              >
                Back to Review
              </button>
              <button
                onClick={handleSign}
                style={{...styles.button, ...styles.primaryButton}}
                disabled={!agreementData.initials.trim()}
              >
                <Check size={16} style={{ marginRight: '4px' }} />
                Sign Agreement
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardHolderAgreementPopup;
