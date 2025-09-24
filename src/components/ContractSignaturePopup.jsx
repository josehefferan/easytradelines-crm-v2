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

  // Inicializar canvas cuando el componente se monta
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      initCanvas(canvasRef);
    }
    if (isOpen && adminCanvasRef.current) {
      initCanvas(adminCanvasRef);
    }
  }, [isOpen]);

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
      alert('Please complete the name and initials');
      return;
    }
    
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas.toDataURL();
    setSignatureData(signatureDataUrl);
    setIsSigned(true);
    
    // Enviar datos completos al componente padre
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

  // Completar firma del admin
  const completeAdminSignature = () => {
    if (!adminName.trim() || !adminInitials.trim()) {
      alert('Please complete the admin name and initials');
      return;
    }
    
    const canvas = adminCanvasRef.current;
    const adminSignatureDataUrl = canvas.toDataURL();
    setAdminSignature(adminSignatureDataUrl);
  };

  // Descargar PDF en blanco
  const downloadBlankPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = getFullContractHTML(true); // true para versión en blanco

    // Verificar si html2pdf está disponible
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

  // Descargar PDF firmado
  const downloadSignedPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = getFullContractHTML(false); // false para versión firmada

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

  // Función para generar el HTML completo del contrato
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
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">COMPENSATION</h2>
        <p><strong>4.1</strong> In exchange for Easy Tradelines Services under this Agreement, the Reseller agrees to pay to Easy Tradelines a fee equal to the amount shown on the schedule of available credit facilities for the credit facility selected by the Reseller. Reseller acknowledges and agrees that the fees charged by Easy Tradelines for the availability of a credit facility varies significantly upon on a number of factors, including, without limitation, the specific program requested by Client, the current status of the Client's credit score and credit history, and the number and type of credit facilities sought by the Reseller. Refunds of any fees paid to Easy Tradelines by Reseller are subject to the terms and conditions set forth in the Service Manual.</p>
        <p><strong>4.2</strong> No fee for Services is earned by Easy Tradelines or the Investor until and unless the Services are deemed completed. For purposes of this Agreement, Services are deemed to be completed, and the fee associated with such Services are deemed to be earned when the addition of the Client as an authorized user of the Investor's credit facility is confirmed.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">TIME FOR PERFORMANCE OF SERVICES</h2>
        <p><strong>5.1</strong> Following execution of this Agreement by the parties, Easy Tradelines will provide Reseller with a schedule of available credit facilities of Easy Tradelines Investors that may be suitable for potentially enhancing a Client's credit score. Notwithstanding anything in this Agreement to the contrary, Reseller acknowledges and agrees that it has the sole and exclusive responsibility to select a credit facility for its Clients, and further acknowledges and agrees that Easy Tradelines is not responsible for determining the suitability of any credit facility to the goals or needs of a Client.</p>
        <p><strong>5.2</strong> Reseller acknowledges and agrees that Easy Tradelines is not involved in any manner whatsoever in the determination or assessment of a FICO score for a Client or whether, when or how a lender may provide information relating to the addition of a Client as an authorized user on a tradeline to a credit reporting bureau. Easy Tradelines Services are deemed complete when it receives confirmation a Client has been added as an authorized user of a tradeline made available under this Agreement.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">LIMITATION OF LIABILITY</h2>
        <p style="text-transform: uppercase;"><strong>6.1 THE TOTAL LIABILITY OF EASY TRADELINES, TOGETHER WITH ANY OF ITS EMPLOYEES, AGENTS, OFFICERS, DIRECTORS, SHAREHOLDERS AND AFFILIATES, FOR DAMAGES ON ACCOUNT OF CLAIMS ARISING FROM OR RELATED TO THIS AGREEMENT, WHETHER BASED ON CONTRACT LAW OR TORT LAW OR OTHERWISE, SHALL NOT EXCEED THE TOTAL AMOUNT OF FEES PAID TO EASY TRADELINES ON ACCOUNT OF THE CLIENT FOR WHOM SUCH CLAIMS ARISE OR RELATE.</strong></p>
        <p style="text-transform: uppercase;"><strong>THE REMEDIES PROVIDED FOR IN THIS AGREEMENT ARE THE SOLE AND EXCLUSIVE REMEDIES FOR RESELLER AND ITS CLIENTS.</strong></p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">COMPLIANCE WITH LAW, POLICIES AND PROCEDURES; NO AGENCY</h2>
        <p><strong>7.1</strong> Reseller shall, at all times, strictly comply with all laws applicable to the Services and shall comply with all policies and procedures established by Easy Tradelines as set forth in the Service Manual, as such laws, policies, procedures and Service Manual may be amended from time to time.</p>
        <p><strong>7.2</strong> Reseller understands that it is not authorized by Easy Tradelines to act as its agent in connection with the Services and agrees that it will not make any representation or statement in any communication with any Client that is or could be construed as a statement that it represents Easy Tradelines in an agency capacity.</p>
        <p><strong>7.3</strong> Nothing in this Agreement is intended to, nor shall it be construed as, creating a partnership, joint venture, agency or franchise arrangement between Reseller and Easy Tradelines.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">ELECTRONIC CONSENT</h2>
        <p><strong>8.1</strong> Reseller agrees, unless specifically requested otherwise, that by entering into this Agreement with Easy Tradelines Reseller affirms consent to receive, in an electronic format, all information, copies of agreements and correspondence from Easy Tradelines and to also send information in an electronic format unless previously agreed upon in writing with Easy Tradelines. Reseller consents and agrees that Easy Tradelines may provide any disclosure, statement, notice, receipt, modification, amendment, and all other evidence of transactions to Reseller by electronic means. All electronic communications will be deemed to be valid and authentic, and Reseller intends and agrees that those electronic communications will be given the same legal effect as written and signed paper communications. Reseller may withdraw the application of any Client at any time prior to the notification by Easy Tradelines of its placement of a Client with an Easy Tradelines Investor.</p>
        <p>Reseller may withdraw a Client application by written notice: (i) by email to: info@easytradelines.com or (ii) by first class United States mail addressed to the following:</p>
        <p style="margin-left: 20px;">
          Smart Latinos Consulting Group LLC<br />
          <strong>777 NW 72ND AVE</strong><br />
          <strong>STE 2008</strong><br />
          <strong>MIAMI, FL 33126</strong>
        </p>
        <p>Any notice of withdrawal of a Client application under this Article 8 shall be deemed effective when received by Easy Tradelines.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">NOTICE</h2>
        <p><strong>9.1</strong> For any notice other than a withdrawal of a Client application under Article 8 above, Easy Tradelines and Reseller agree that such notice shall be given as follows:</p>
        <p><strong>EASY TRADELINES:</strong><br />
        Smart Latinos Consulting Group LLC<br />
        <strong>777 NW 72ND AVE</strong><br />
        <strong>STE 2008</strong><br />
        <strong>MIAMI, FL 33126</strong></p>
        
        <p><strong>RESELLER:</strong><br />
        ${isBlank ? '(Reseller name) _______________________________' : `${brokerData.first_name} ${brokerData.last_name}`}<br />
        ${isBlank ? '(Reseller Address) _______________________________' : brokerData.company_name}<br />
        ${isBlank ? '(Reseller telephone) _______________________________' : brokerData.phone}<br />
        ${isBlank ? '(Reseller email) _______________________________' : brokerData.email}</p>
        
        <p><strong>Registered Agent authorized to receive service of process:</strong><br />
        <strong>BERQUEZ CONSULTING FIRM, CORP.</strong><br />
        <strong>777 NW 72ND AVE</strong><br />
        <strong>STE 2071</strong><br />
        <strong>MIAMI, FL 33126</strong></p>
        
        <p>Any notice under this Article 9 shall be deemed given when: (i) delivered in person; (ii) sent by facsimile transmission with a confirming copy sent by regular mail; or (iii) deposited into first class United States mail, either through certified or registered mail return receipt requested service, with the correct address of the recipient and full postage.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">CONFIDENTIAL INFORMATION</h2>
        <p><strong>10.1</strong> Easy Tradelines agrees it will not sell, copy, release, or disclose any information of a Client, other than to its employees, agents and Easy Tradelines Investors, without the written consent of Reseller; provided however, that Easy Tradelines may disclose Client information as required by valid legal process.</p>
        <p><strong>10.2</strong> All information provided by Easy Tradelines to Reseller, including without limitation, this Agreement and the Service Manual, ("Easy Tradelines Information") shall be deemed to be proprietary and confidential. Other than its employees, officers, and directors with a need to know such information in order to fulfill the purposes of this Agreement, Reseller shall not disclose or share any Easy Tradelines Information with any person or entity without first obtaining the written consent of Easy Tradelines; provided however that Reseller may, with not less than three (3) business days prior written notice, disclose Easy Tradelines Information pursuant to valid legal process. In the event of an unauthorized disclosure or potential unauthorized disclosure, Easy Tradelines shall be entitled to obtain injunctive relief from any court of competent jurisdiction with the need to demonstrate irreparable harm, the absence of an adequate remedy at law or in equity, or damages, and without a requirement of the posting of a bond or other security.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">ARBITRATION/LITIGATION</h2>
        <p><strong>11.1</strong> In the event of any dispute, claim, question, or disagreement arising from or relating to this Agreement other than a dispute involving the payment of services rendered by Easy Tradelines, the parties hereto shall use their best efforts to settle the dispute, claim, question, or disagreement. To this effect, the parties shall consult and negotiate with each other in good faith and, recognizing their mutual interests, attempt to reach a just and equitable solution satisfactory to both parties. If they do not reach resolution within a period of sixty (60) days, then, upon notice by either party to the other, all disputes, claims, questions, or disagreements shall be resolved by binding arbitration administered by a single arbitrator mutually agreed upon by the parties. If the parties cannot agree upon a single arbitrator, each party shall select an arbitrator and these arbitrators shall select a single arbitrator who will arbitrate the dispute. The parties agree that jurisdiction and venue for any proceeding relating to this Agreement, including arbitration, shall be limited to the City and County of Los Angeles, State of California.</p>
        <p><strong>11.2</strong> If Reseller fails to pay for the services rendered by Easy Tradelines, as result of a chargeback or credit card dispute initiated by any Client, Easy Tradelines shall be entitled to pursue collection proceedings against the Reseller in the County or District Court of the City and County of Los Angeles, State of California. Client consents to jurisdiction and venue in the City and County of Los Angeles, State of California. Where Easy Tradelines must seek legal recourse for the purpose of collecting or otherwise enforcing a judgment hereunder, such proceedings may be commenced in any appropriate venue. Reseller expressly waives any right to a jury trial if a collection proceeding is initiated by Easy Tradelines or its agents. In any legal proceeding or arbitration involving a dispute arising from or related to this Agreement, Easy Tradelines shall be entitled to recover from Reseller or the Client, or both as the case may be, the attorney fees and costs reasonably incurred by Easy Tradelines in such proceeding or arbitration, and if the dispute involves the non-payment of fees for Services rendered by Easy Tradelines, then Easy Tradelines shall be entitled to recover interest upon such fees at the rate of 19% per annum from the date such fees are due and payable through the date of collection.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">GOVERNING LAW</h2>
        <p><strong>12.1</strong> This Agreement shall be interpreted and governed by the laws of the State of Florida, without regard to its choice of law rules.</p>
        <p><strong>12.2</strong> Unless otherwise provided by Florida law, Easy Tradelines and Client agree that in the event any legal proceeding concerning this Agreement is instituted, jurisdiction and venue of such proceeding shall be in a court of competent jurisdiction in Los Angeles County, California.</p>
        
        <h2 style="font-size: 14px; font-weight: bold; margin: 20px 0 10px 0;">13. GENERAL PROVISIONS</h2>
        <p><strong>13.1</strong> This Agreement comprises the entire agreement between the parties. All prior negotiations and dealings between them are merged in, integrated and superseded by this Agreement, which is binding upon and ensures to the benefit of the parties and their successors, legal representatives and assigns.</p>
        <p><strong>13.2</strong> Reseller may not assign this Agreement in whole or in part without the prior written consent of Easy Tradelines.</p>
        <p><strong>13.3</strong> In case any term, phrase, clause, paragraph, article, restriction, or covenant contained in this Agreement shall be held to be invalid or unenforceable, the same shall be deemed, and it is hereby agreed that the same are meant to be several, and shall not defeat or impair the remaining provisions hereof.</p>
        <p><strong>13.4</strong> If performance of this Agreement or any obligation under this Agreement is prevented, restricted, or interfered with by causes beyond either party's reasonable control ("Force Majeure") and if the party unable to carry out its obligations gives the other party prompt written notice of such event, then the obligations of the party invoking this provision shall be suspended to the extent necessary by such event. The term Force Majeure shall include, without limitation, acts of God, fire, explosion, vandalism, storm or other similar occurrence, orders or acts of military or civil authority, or by national emergencies, insurrections, riots, or wars, or strikes, lock-outs, work stoppages. The excused party shall use reasonable efforts under the circumstances to avoid or remove such causes of non-performance and shall proceed to perform with reasonable dispatch whenever such causes are removed or ceased.</p>
        <p><strong>13.5</strong> This Agreement may only be modified or amended by a writing signed by Easy Tradelines and Reseller.</p>
        <p><strong>13.6</strong> Notwithstanding any provision herein to the contrary, Easy Tradelines may terminate this Agreement, and the Reseller's right to provide services made available to it under this Agreement, at any time for any reason for no reason and without prior notice to the Reseller.</p>
        
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
