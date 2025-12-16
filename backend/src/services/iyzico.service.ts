import Iyzipay from 'iyzipay';

// İyzico client oluştur
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL!
});

export interface IyzicoPaymentRequest {
  locale?: string;
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentChannel?: string;
  paymentGroup?: string;
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    registerCard?: string;
  };
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }>;
}

/**
 * Ödeme al (Payment)
 */
export const createPayment = async (
  paymentRequest: IyzicoPaymentRequest
): Promise<any> => {
  return new Promise((resolve, reject) => {
    iyzipay.payment.create(paymentRequest as any, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Ödeme durumunu kontrol et
 */
export const checkPaymentStatus = async (
  paymentId: string,
  conversationId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    iyzipay.payment.retrieve(
      {
        paymentId,
        conversationId
      } as any,
      (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

/**
 * İptal / İade (Refund)
 */
export const refundPayment = async (
  paymentTransactionId: string,
  price: string,
  currency: string,
  ip: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    iyzipay.refund.create(
      {
        paymentTransactionId,
        price,
        currency,
        ip
      } as any,
      (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export default iyzipay;
