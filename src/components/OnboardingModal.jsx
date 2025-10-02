import React, { useState } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ContractSignaturePopup from './ContractSignaturePopup';

const OnboardingModal = ({ isOpen, brokerData, onComplete }) => {
  const [showContractPopup, setShowContractPopup] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleContractSign = (signatureResult) => {
    setSignatureData(signatureResult);
    setContractSigned(true);
    setShowContractPopup(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PNG, JPG, JPEG, or PDF files are allowed');
        return;
      }
      
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setDriverLicenseFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!contractSigned) {
      setError('Please sign the contract first');
      return;
    }

    if (!driverLicenseFile) {
      setError('Please upload your Driver License');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Subir Driver License a Supabase Storage
      const fileExt = driverLicenseFile.name.split('.').pop();
      const fileName = `${brokerData.id}/driver_license_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('broker-documents')
        .upload(fileName, driverLicenseFile);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('broker-documents')
        .getPublicUrl(fileName);

      // 3. Actualizar broker con documentos enviados y firma
      const { error: updateError } = await supabase
        .from('brokers')
        .update({
          contract_signed: true,
          contract_signed_date: new Date().toISOString(),
          broker_signature_data: signatureData?.signatureImage,
          broker_name_signed: signatureData?.contractData?.reseller_name,
          broker_initials_signed: signatureData?.contractData?.reseller_initials,
          driver_license_uploaded: true,
          driver_license_url: publicUrl
        })
        .eq('id', brokerData.id);

      if (updateError) throw updateError;

      // 4. Notificar completado
      onComplete();

    } catch (err) {
      console.error('Error submitting documents:', err);
      setError('Error uploading documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '2px solid #e5e7eb',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
              <AlertCircle size={28} />
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                  Complete Your Registration
                </h2>
                <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>
                  Sign contract and upload documents to activate your account
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px', maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {/* Step 1: Contract */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                Step 1: Sign Reseller Agreement
              </h3>
              {!contractSigned ? (
                <div style={{
                  border: '2px dashed #fbbf24',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#fef3c7'
                }}>
                  <FileText style={{ width: '40px', height: '40px', color: '#d97706', margin: '0 auto 12px' }} />
                  <p style={{ color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
                    Contract signature required
                  </p>
                  <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '16px' }}>
                    Review and sign the reseller agreement to continue
                  </p>
                  <button
                    onClick={() => setShowContractPopup(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Review & Sign Contract
                  </button>
                </div>
              ) : (
                <div style={{
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Check style={{ width: '24px', height: '24px', color: '#059669' }} />
                  <div>
                    <p style={{ color: '#059669', fontWeight: '600', margin: 0 }}>
                      Contract signed successfully
                    </p>
                    <p style={{ fontSize: '12px', color: '#059669', margin: '4px 0 0 0' }}>
                      Signed on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Driver License */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                Step 2: Upload Driver License or ID
              </h3>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: driverLicenseFile ? '#f0fdf4' : '#fafafa'
              }}>
                <input
                  type="file"
                  id="driverLicense"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="driverLicense" style={{ cursor: 'pointer', display: 'block' }}>
                  {driverLicenseFile ? (
                    <>
                      <Check style={{ width: '40px', height: '40px', color: '#16a34a', margin: '0 auto 12px' }} />
                      <p style={{ fontWeight: '600', color: '#16a34a', marginBottom: '4px' }}>
                        {driverLicenseFile.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        Click to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload style={{ width: '40px', height: '40px', color: '#6b7280', margin: '0 auto 12px' }} />
                      <p style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Click to upload Driver License
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Warning */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#1e40af'
            }}>
              <strong>Note:</strong> Your account will remain inactive until an admin reviews and validates your documents.
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleSubmit}
              disabled={!contractSigned || !driverLicenseFile || uploading}
              style={{
                padding: '12px 24px',
                backgroundColor: contractSigned && driverLicenseFile && !uploading ? '#16a34a' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: contractSigned && driverLicenseFile && !uploading ? 'pointer' : 'not-allowed'
              }}
            >
              {uploading ? 'Submitting...' : 'Submit Documents'}
            </button>
          </div>
        </div>
      </div>

      <ContractSignaturePopup
        isOpen={showContractPopup}
        onClose={() => setShowContractPopup(false)}
        brokerData={brokerData}
        onSignComplete={handleContractSign}
      />
    </>
  );
};

export default OnboardingModal;
