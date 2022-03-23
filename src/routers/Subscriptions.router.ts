import { CommonRouter } from '@Routers/Common.router'
import { Application } from 'express'
import { SubscriptionsController } from '@Controllers';
import { authMiddleware } from '@Middlewares';

export class SubscriptionsRouter extends CommonRouter {
  constructor(app: Application) {
    super(app, 'SubscriptionsRouter');
  }

  assignAllRouterTypes() {
    this.assignPostRoutes();
    this.assignGetRoutes();
  }

  assignPostRoutes() {
    this.router.post('/', authMiddleware, SubscriptionsController.createSubscriptionWithPayment);
    this.router.post('/confirm', authMiddleware, SubscriptionsController.confirmSubscription);
    this.router.post('/check', authMiddleware, SubscriptionsController.checkForSubscription);
    this.router.post('/cancel', authMiddleware, SubscriptionsController.cancelSubscription);
  }

  assignGetRoutes() {
    this.router.get('/', authMiddleware, SubscriptionsController.getUserSubscriptions);
    this.router.get('/products', authMiddleware, SubscriptionsController.getSubscriptionProducts);
  }

  configureRoutes(): Application {
    this.app.use('/subscriptions', this.router);

    return this.app;
  }
}