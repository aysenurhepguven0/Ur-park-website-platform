import React, { useState } from 'react';
import axios from 'axios';
import './PaymentForm.css';

interface IyzicoPaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const IyzicoPaymentForm: React.FC<IyzicoPaymentFormProps> = ({
  bookingId,
  amount,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Kart numarası formatı (4'lü gruplar halinde)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.replace(/\s/g, '').length > 16) {
        return;
      }
    }

    // Sadece rakamlar
    if (name === 'expireMonth' || name === 'expireYear' || name === 'cvc') {
      formattedValue = value.replace(/\D/g, '');
    }

    // Ay limiti
    if (name === 'expireMonth' && formattedValue.length > 2) {
      return;
    }

    // Yıl limiti (YY formatı)
    if (name === 'expireYear' && formattedValue.length > 2) {
      return;
    }

    // CVC limiti
    if (name === 'cvc' && formattedValue.length > 3) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Kart sahibinin adı zorunludur';
    }

    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Kart numarası zorunludur';
    } else if (cardNumber.length !== 16) {
      newErrors.cardNumber = 'Kart numarası 16 haneli olmalıdır';
    }

    const month = parseInt(formData.expireMonth);
    if (!formData.expireMonth) {
      newErrors.expireMonth = 'Ay zorunludur';
    } else if (month < 1 || month > 12) {
      newErrors.expireMonth = 'Geçerli bir ay girin (01-12)';
    }

    const year = parseInt(formData.expireYear);
    const currentYear = new Date().getFullYear() % 100; // Son 2 hane
    if (!formData.expireYear) {
      newErrors.expireYear = 'Yıl zorunludur';
    } else if (year < currentYear) {
      newErrors.expireYear = 'Kartın süresi dolmuş';
    }

    if (!formData.cvc) {
      newErrors.cvc = 'CVC zorunludur';
    } else if (formData.cvc.length !== 3) {
      newErrors.cvc = 'CVC 3 haneli olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

      const response = await axios.post(
        `${API_URL}/payments/create`,
        {
          bookingId,
          cardDetails: {
            cardHolderName: formData.cardHolderName.toUpperCase(),
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            expireMonth: formData.expireMonth.padStart(2, '0'),
            expireYear: formData.expireYear,
            cvc: formData.cvc
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        onSuccess();
      } else {
        onError(response.data.message || 'Ödeme işlemi başarısız oldu');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form iyzico-form">
      <div className="form-group">
        <label htmlFor="cardHolderName">Kart Üzerindeki İsim *</label>
        <input
          type="text"
          id="cardHolderName"
          name="cardHolderName"
          value={formData.cardHolderName}
          onChange={handleInputChange}
          placeholder="AHMET YILMAZ"
          className={errors.cardHolderName ? 'error' : ''}
          disabled={isLoading}
          style={{ textTransform: 'uppercase' }}
        />
        {errors.cardHolderName && (
          <span className="error-text">{errors.cardHolderName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="cardNumber">Kart Numarası *</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleInputChange}
          placeholder="1234 5678 9012 3456"
          className={errors.cardNumber ? 'error' : ''}
          disabled={isLoading}
          maxLength={19}
        />
        {errors.cardNumber && (
          <span className="error-text">{errors.cardNumber}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expireMonth">Ay *</label>
          <input
            type="text"
            id="expireMonth"
            name="expireMonth"
            value={formData.expireMonth}
            onChange={handleInputChange}
            placeholder="MM"
            className={errors.expireMonth ? 'error' : ''}
            disabled={isLoading}
            maxLength={2}
          />
          {errors.expireMonth && (
            <span className="error-text">{errors.expireMonth}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="expireYear">Yıl *</label>
          <input
            type="text"
            id="expireYear"
            name="expireYear"
            value={formData.expireYear}
            onChange={handleInputChange}
            placeholder="YY"
            className={errors.expireYear ? 'error' : ''}
            disabled={isLoading}
            maxLength={2}
          />
          {errors.expireYear && (
            <span className="error-text">{errors.expireYear}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cvc">CVC *</label>
          <input
            type="text"
            id="cvc"
            name="cvc"
            value={formData.cvc}
            onChange={handleInputChange}
            placeholder="123"
            className={errors.cvc ? 'error' : ''}
            disabled={isLoading}
            maxLength={3}
          />
          {errors.cvc && (
            <span className="error-text">{errors.cvc}</span>
          )}
        </div>
      </div>

      <div className="payment-amount">
        <h3>Ödenecek Tutar</h3>
        <p className="amount">₺{amount.toFixed(2)}</p>
      </div>

      <button
        disabled={isLoading}
        type="submit"
        className="btn btn-primary full-width payment-submit"
      >
        {isLoading ? (
          <>
            <div className="spinner"></div>
            <span style={{ marginLeft: '8px' }}>İşlem yapılıyor...</span>
          </>
        ) : (
          `₺${amount.toFixed(2)} Öde`
        )}
      </button>

      <p className="payment-disclaimer">
        * Ödeme İyzico güvencesi altında işlenmektedir. Kart bilgileriniz saklanmaz.
      </p>
    </form>
  );
};

export default IyzicoPaymentForm;
