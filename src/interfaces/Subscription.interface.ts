import Stripe from 'stripe'

export interface ISubscription {
  subId: string;
  userId: string;
  startedAt: Date;
  endAt: Date;
  isExpired: boolean;
  level: string;
}

export interface WithStripePrice {
  price: Stripe.Price;
}

export interface ICustomerDataForSubscription {
  priceId: string | undefined;
}

export interface ISubscriptionPaymentCustomerData extends ICustomerDataForSubscription {
  email: string;
  payment_method: string;
}