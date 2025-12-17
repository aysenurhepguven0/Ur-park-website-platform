import React, { useState, useEffect } from 'react';
import { phoneApi } from '../services/api';
import './PhoneVerification.css';

interface PhoneVerificationProps {
  onVerified?: () => void;
}

type Step = 'status' | 'input' | 'verify';

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onVerified }) => {
  const [step, setStep] = useState<Step>('status');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    fetchPhoneStatus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchPhoneStatus = async () => {
    try {
      setLoading(true);
      const response = await phoneApi.getStatus();
      const { phone: maskedNum, isVerified: verified } = response.data.data;
      setMaskedPhone(maskedNum);
      setIsVerified(verified);
      setStep('status');
    } catch (err) {
      console.error('Error fetching phone status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await phoneApi.sendCode(phone);
      setSuccess(response.data.data.message);
      setStep('verify');
      setCountdown(60); // 60 second cooldown for resend
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code.trim() || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      await phoneApi.verify(code);
      setSuccess('Phone number verified successfully!');
      setIsVerified(true);
      setStep('status');
      fetchPhoneStatus();
      onVerified?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const response = await phoneApi.resendCode();
      setSuccess(response.data.data.message);
      setCountdown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhone = async () => {
    if (!window.confirm('Are you sure you want to remove your phone number?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await phoneApi.remove();
      setSuccess('Phone number removed successfully');
      setMaskedPhone(null);
      setIsVerified(false);
      setPhone('');
      setCode('');
      setStep('status');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setPhone('');
    setCode('');
    setError('');
    setSuccess('');
    setStep('input');
  };

  if (loading && step === 'status' && !maskedPhone) {
    return <div className="phone-verification loading">Loading...</div>;
  }

  return (
    <div className="phone-verification">
      <div className="phone-header">
        <h3>Phone Verification</h3>
        <p className="phone-description">
          Add and verify your phone number for enhanced security and booking notifications.
        </p>
      </div>

      {error && <div className="phone-error">{error}</div>}
      {success && <div className="phone-success">{success}</div>}

      {step === 'status' && (
        <div className="phone-status">
          {maskedPhone ? (
            <div className="phone-info">
              <div className="phone-number-display">
                <span className="phone-icon">
                  {isVerified ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  )}
                </span>
                <span className="phone-value">{maskedPhone}</span>
                <span className={`verification-badge ${isVerified ? 'verified' : 'unverified'}`}>
                  {isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="phone-actions">
                {!isVerified && (
                  <button
                    className="btn-verify"
                    onClick={() => setStep('verify')}
                    disabled={loading}
                  >
                    Verify Now
                  </button>
                )}
                <button
                  className="btn-change"
                  onClick={handleChangeNumber}
                  disabled={loading}
                >
                  Change Number
                </button>
                <button
                  className="btn-remove"
                  onClick={handleRemovePhone}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="no-phone">
              <p>No phone number added yet.</p>
              <button
                className="btn-add-phone"
                onClick={() => setStep('input')}
                disabled={loading}
              >
                Add Phone Number
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'input' && (
        <form className="phone-form" onSubmit={handleSendCode}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
              disabled={loading}
            />
            <small>Enter your phone number with country code</small>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setStep('status')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-send-code"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        </form>
      )}

      {step === 'verify' && (
        <form className="verify-form" onSubmit={handleVerify}>
          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              autoComplete="one-time-code"
              disabled={loading}
            />
            <small>Enter the 6-digit code sent to your phone</small>
          </div>
          <div className="resend-section">
            <button
              type="button"
              className="btn-resend"
              onClick={handleResendCode}
              disabled={loading || countdown > 0}
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setStep('status')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-verify-code"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Phone'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PhoneVerification;
