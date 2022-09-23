import Stripe from 'stripe'
import {IUserCommon} from './User.interface';
import {Document, Model, Schema} from 'mongoose';

export interface ISubscription {
  subId: string;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  endAt: Date;
  isExpired: boolean;
  level: string;
  productId: string;
}

export interface ISubscriptionModel extends Model<ISubscription> {
  build: (subData: ISubscriptionSuccess, userData: IUserCommon) => ISubscription & Document
}

export interface ISubscriptionSuccess {
  clientSecret: string;
  level: string;
  createdAt: number;
  endAt: number;
  subId: string;
  isExpired: boolean;
  status: string;
  productId: string;
}

export interface WithStripePrice {
  price: Stripe.Price;
}

export interface ICustomerDataForSubscription {
  priceId: string | undefined;
}

export interface ISubscriptionPaymentCustomerData extends ICustomerDataForSubscription {
  payment_method: string;
}