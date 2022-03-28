import { useSend } from '@Helpers'
import {ISubscriptionPaymentCustomerData, ISubscriptionSuccess, MyRequest, MyResponse} from '@Interfaces';
import { SubscriptionService } from '../services/Subscription.service'

export class SubscriptionsController {
  static async getUserSubscriptions(req: MyRequest<any>, res: MyResponse) {
    const send = useSend(res);
    try {
      if (!req.user) throw new Error('Unauthenticated');

      const { id } = req.user;

      const subscriptions = await SubscriptionService.getUserSubscriptions(id);

      send(200, 'Subscription has been received', { subscriptions });
    } catch (e: any) {
      return send(500, e.message);
    }
  }

  static async getSubscriptionProducts(req: MyRequest<any>, res: MyResponse) {
    const send = useSend(res);
    try {
      const products = await SubscriptionService.getProducts();

      send(200, 'Subscriptions products has been received', { products });
    } catch (e: any) {
      send(500, e.message);
    }
  }

  static async createSubscriptionWithPayment(req: MyRequest<ISubscriptionPaymentCustomerData>, res: MyResponse) {
    const send = useSend(res);
    try {
      if (!req.body || !req.user) throw new Error('Something went wrong');
      const {payment_method, priceId} = req.body;
      const { email } = req.user;

      const subscriptionData = await SubscriptionService.createSubscriptionWithPayment({
        priceId
      }, {
        email, payment_method,
        invoice_settings: {
          default_payment_method: payment_method
        }
      });

      send(201, 'Data: ', { subscriptionData });
    } catch (e: any) {
      send(500, e.message);
    }
  }

  static async confirmSubscription(req: MyRequest<{ subscriptionData: ISubscriptionSuccess }>, res: MyResponse) {
    const send = useSend(res);
    try {
      if (!req.body || !req.user) throw new Error('Something went wrong');
      const { subscriptionData } = req.body;

      const sub = await SubscriptionService.confirmSubscription(subscriptionData, req.user);

      send(201, 'Successfully confirmed', { sub, confirmed: true });
    } catch (e: any) {
      send(500, e.message);
    }
  }

  static async checkForSubscription() {

  }

  static async cancelSubscription() {

  }
}