import Stripe from 'stripe';
import { asString } from '@Helpers';
import {ICustomerDataForSubscription, ISubscription, IUserCommon, IUserDTO, WithStripePrice} from '@Interfaces';
import { Subscription } from '@Models';

export class SubscriptionService {
  private static stripe: Stripe = new Stripe(asString(process.env.STRIPE_SECRET_KEY), { apiVersion: '2020-08-27' });
  private static products: Stripe.Response<Stripe.Product>[] = [];
  private static subs: Stripe.Subscription[] = [];

  private static async getSubscriptions() {
    if (this.subs) return this.subs;
    const subs = await SubscriptionService.stripe.subscriptions.list();
    if (!subs) return this.subs;
    this.subs = subs.data;
    return this.subs;
  }

  static async getProducts() {
    if (SubscriptionService.products && SubscriptionService.products.length) return this.products;
    const prices = await SubscriptionService.stripe.prices.list({ active: true });
    if (!prices) return this.products;

    let productsPromises = [];
    for (const priceData of prices?.data) {
      productsPromises.push(new Promise(
        res => res(SubscriptionService.stripe.products.retrieve(asString(priceData.product)))
      ));
    }

    const products: Array<Stripe.Response<Stripe.Product> & WithStripePrice> = await Promise.all(productsPromises).then(prods => {
      return prods.reduce((acc: any[], prod: any) => {
        if (!prod.active) return acc;
        const priceOfTheProduct = prices.data.find(price => price.product === prod.id);
        if (!priceOfTheProduct) return acc;
        prod.price = priceOfTheProduct;
        acc.push(prod);
        return acc;
      }, []);
    });

    if (!products || !products.length) return SubscriptionService.products;

    SubscriptionService.products = products;
    return products;
  }

  static async getUserSubscriptions(userId: string) {
    const subs = await SubscriptionService.getSubscriptions();
    const userSubs = await Subscription.find({ userId });

    return userSubs.reduce((acc: any[], sub: any) => {
      const found = subs.find(s => s.id === sub.subId);
      if (found) {
        delete sub._id;
        acc.push({
          ...found,
          ...sub
        });
      }
      return acc;
    }, []);
  }

  static async createSubscriptionWithPayment(
    customerData: ICustomerDataForSubscription,
    createCustomerConfig: Stripe.CustomerCreateParams
  ): Promise<any | void> {
    if (!createCustomerConfig) throw new Error('No config for creating token');

    const customer = await SubscriptionService.stripe.customers.create(createCustomerConfig);
    if (!customer) throw new Error('Something went wrong with the payment. Try later');

    const subscription = await SubscriptionService.stripe.subscriptions.create({
      customer: customer.id,
      items: [{price: customerData.priceId}],
      expand: ['latest_invoice.payment_intent']
    });

    if (!subscription) throw new Error('Something went wrong with creating your subscription. Try later');

    return subscription;
    // const clientSecret = (<any>subscription.latest_invoice).payment_intent?.client_secret;
    //
    // return {
    //   clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
    //   level: '',
    //   createdAt: '',
    //   endedAt: ''
    //   subId: '',
    // }
  }

	static async confirmSubscription(subId: string, user: IUserCommon) {

	}

  static async checkUserForExistingSubs(user: IUserCommon, subId: string) {
    const subs = await Subscription.find({email: user.email});

    if (!subs.length) return null;



    const existed = subs;
  }
}