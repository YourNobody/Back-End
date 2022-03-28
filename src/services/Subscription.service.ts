import Stripe from 'stripe';
import {asString, inMilliseconds} from '@Helpers';
import {
  ICustomerDataForSubscription,
  ISubscription,
  ISubscriptionSuccess,
  IUserCommon,
  IUserDTO,
  WithStripePrice,
} from '@Interfaces';
import {Subscription, User} from '@Models';
import {SubscriptionDto} from '../dtos/Subscription.dto';

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

  static async getUserSubscriptions(userId: any) {
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
  ): Promise<ISubscriptionSuccess> {
    if (!createCustomerConfig) throw new Error('No config for creating token');

    const customer = await SubscriptionService.stripe.customers.create(createCustomerConfig);
    if (!customer) throw new Error('Something went wrong with the payment. Try later');

    const subscription = await SubscriptionService.stripe.subscriptions.create({
      customer: customer.id,
      items: [{price: customerData.priceId}],
      expand: ['latest_invoice.payment_intent']
    });

    const subLI = subscription.latest_invoice as any;

    if (!subscription || subLI.status !== 'paid') throw new Error('Something went wrong with creating your subscription. Try later');

    const clientSecret = subLI.payment_intent?.client_secret;
    const now = Date.now();
    const interval = subscription.items.data[0].price.recurring?.interval;

    await SubscriptionService.getProducts();
    const product = SubscriptionService.products.find(prod => prod.id === subscription.items.data[0].plan.product);
    if (!product || !product.unit_label) throw new Error('Something went wrong with creating your subscription. Try later');

    SubscriptionService.subs.push(subscription);

    return {
      clientSecret: clientSecret,
      level: product.unit_label,
      createdAt: now,
      endAt: now + inMilliseconds(interval || 'week'),
      subId: subscription.id,
      isExpired: false,
      status: subLI.payment_intent.status,
      productId: product.id
    }
  }

	static async confirmSubscription(subData: ISubscriptionSuccess, userPayload: IUserCommon) {
    const user = await User.findById(userPayload.id);
    if (!user) throw new Error('Something went wrong with the session');

    await SubscriptionService.getSubscriptions();
    await SubscriptionService.getProducts();

    const newSub = SubscriptionService.subs.find(sub => sub.id === subData.subId);
    if (!newSub) throw new Error('Something went wrong with subscription confirmation');

    const existed = await Subscription.findOne({ productId: subData.productId, userId: userPayload.id });
    if (!existed) {
      const subDB = Subscription.build(subData, userPayload);
      await subDB.save();
      return SubscriptionDto.createSubscriptionDto(subData, userPayload);
    }

    if (!existed.isExpired) throw new Error('The subscription already exists and is active');

    await SubscriptionService.stripe.subscriptions.del(existed.subId);

    existed.isExpired = false;
    existed.createdAt = new Date(subData.createdAt);
    existed.endAt = new Date(subData.endAt);
    existed.subId = subData.subId;

    await existed.save();

    return SubscriptionDto.createSubscriptionDto(subData, userPayload);
	}

  static async checkUserForExistingSubs(user: IUserCommon, subId: string) {
    const subs = await Subscription.find({email: user.email});

    if (!subs.length) return null;



    const existed = subs;
  }
}