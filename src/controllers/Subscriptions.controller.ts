import { useSend } from '@Helpers'
import { ISubscriptionPaymentCustomerData, MyRequest, MyResponse } from '@Interfaces'
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
      if (!req.body) throw new Error('Something went wrong');
      const {email, payment_method, priceId} = req.body;

      const data = await SubscriptionService.createSubscriptionWithPayment({ priceId }, { email, payment_method });

      send(201, 'Data: ', { data });
    } catch (e: any) {
      send(500, e.message);
    }
  }

  static async confirmSubscription() {

  }

  static async checkForSubscription() {

  }

  static async cancelSubscription() {

  }
}