import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import './PaymentForm.css';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success?bookingId=${bookingId}`
        }
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'An error occurred');
          onError(error.message || 'An error occurred');
        } else {
          setMessage('An unexpected error occurred.');
          onError('An unexpected error occurred.');
        }
      } else {
        // Payment succeeded - redirect will happen automatically
        onSuccess();
      }
    } catch (err: any) {
      setMessage(err.message || 'Payment failed');
      onError(err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-amount">
        <h3>Total Amount</h3>
        <p className="amount">₺{amount.toFixed(2)}</p>
      </div>

      <PaymentElement
        id="payment-element"
        options={{
          layout: 'tabs'
        }}
      />

      {message && <div className="payment-message error">{message}</div>}

      <button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className="btn btn-primary full-width payment-submit"
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          `Pay ₺${amount.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

export default PaymentForm;
