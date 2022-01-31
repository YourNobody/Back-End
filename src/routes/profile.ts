import { Router } from 'express';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import { useSend } from '../helpers/send.helper';
import { IChangeEmail, IChangeNickname, IChangePassword, profileChangeTypes } from '../interfaces/User.interface';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { getHashedPassword, withoutParameter } from '../helpers/data.helper';
import { _id, SUBSCRIPTION } from '../constants/app'
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2020-08-27'
});

router.post('/change', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');

    const args = req.body;

    if (!args.key) throw new Error('Key wan\'t provided');
    
    let body = null;
    if (!req.session.token && !req.session.user) throw new Error('User isn\'t authenticated');
    const self = await User.findById(req.session.user?._id);
    let message: string;
    switch(args.key as profileChangeTypes) {
      case 'email': {
        body = {
          email: req.body.email
        } as IChangeEmail;

        const candidates = await User.find({ email: body.email });
        if (candidates.length) throw new Error('User with such the email already exists');

        await self?.updateOne({ email: body.email });
        message = 'Email has been changed';
        break;
      }
      case 'nickname': {
        body = {
          nickname: req.body.nickname
        } as IChangeNickname;

        const candidates = await User.find({ nickname: body.nickname });
        if (candidates.length) throw new Error('User with such the nickname already exists');

        await self?.updateOne({ nickname: body.nickname });
        message = 'Nickname has been changed';
        break;
      }
      case 'password': {
        body = {
          password: req.body.password,
          oldPassword: req.body.oldPassword,
          confirm: req.body.confirm
        } as IChangePassword;

        if (req.session.user?.password) {
          const isSameOld = await bcrypt.compare(body.oldPassword, req.session.user?.password);
          if (isSameOld) {
            const confirmed = body.password === body.confirm;

            if (!confirmed) throw new Error('New password isn\'t confirmed');
            
            await self?.updateOne({ password: getHashedPassword(body.password, 10) as string });
            message = 'Password has been changed';
          } else throw new Error('Your old password entered incorrectly');
        } else {
          throw new Error('Something went wrong');
        }
        break;
      }
      default: throw new Error('Something wasn\'t provided');
    }
    if (message) return send(201, message, {
      // @ts-ignore
      user: withoutParameter(withoutParameter({...self?._doc}, 'password'), _id, 'id'),
      token: req.session.token
    });
  } catch (err: any) {
    send(500, err.message);
    console.log(err);
  }
});

router.get('/payment/sub', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    const allPrices = await stripe.prices.list({ active: true });
    let productsPromises = [];
    for (const priceData of allPrices?.data) {
      productsPromises.push(new Promise(
        res => res(stripe.products.retrieve(priceData.product as string))
      ));
    }
    const subs = await stripe.subscriptions.list();
    const products = await Promise.all(productsPromises).then(prods => prods.reduce((acc: any[], prod: any, index, array) => {
      if (!prod.active) return acc;
      const priceOfTheProduct = allPrices.data.find(price => price.product === prod.id);
      if (!priceOfTheProduct) return acc;
      prod.price = priceOfTheProduct;
      acc.push(prod);
      return acc;
    }, []));
    if (req.session.user) {
      const user = await User.findById(req.session.user._id);
      if (!user) throw new Error('Something went wrong with the session');
      const userSubs = subs.data.filter((sub: any) => {
        for (let subId of user.subscriptions) {
          if (sub.id === subId) {
            sub.active = !sub.cancel_at_period_end;
            if (sub.status === 'canceled') sub.active = false;
            return true;
          }
        }
      });
      return send(200, 'Subscriptions have been got', { subscriptions: products, userSubscriptions: userSubs || [] });
    }

    return send(200, 'Subscriptions have been got', { subscriptions: products, userSubscriptions: [] });
  } catch (e: any) {
    console.log(e.message);
    send(500, e.message, { success: false });
  }
});

router.post('/payment/sub', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');
    const {email, payment_method, priceId} = req.body;

    const customer = await stripe.customers.create({
      payment_method: payment_method,
      email: email,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    if (!customer) throw new Error('Something went wrong with the payment. Try later');

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{price: priceId}],
      expand: ['latest_invoice.payment_intent']
    });

    if (!subscription) throw new Error('Something went wrong with creating your subscription. Try later');
    else {
      return send(201, 'Client secret token created successfully', {
        //@ts-ignore
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        //@ts-ignore
        status: subscription.latest_invoice?.payment_intent?.status,
        id: subscription.id
      });
    }

  } catch (e: any) {
    console.log(e.message);
    send(500, e.message, { success: false });
  }
});

router.post('/payment/sub/confirm', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);

  const helper = async (iterable: any[], ) => {
    let subs = [];
    for (let s of iterable) {
      subs.push(new Promise(res => res(stripe.subscriptions.retrieve(s.id))));
    }
    return await Promise.all(subs);
  }
  try {
    if (!req.body) throw new Error('Something went wrong');
    const { id } = req.body;
    if (!req.session.user) throw new Error('Please authorize to subscribe');
    const user = await User.findById(req.session.user._id);
    if (!user) throw new Error('Something went wrong with the session');
    const exist = user.subscriptions.find((sub: any) => sub.id === id);
    if (exist) {
      const userSubs = await helper(user.subscriptions);
      return send(201, 'You already have this subscription', { subscription: userSubs});
    } else {
      const sub = await stripe.subscriptions.retrieve(id);
      if (!sub) throw new Error('Something went wrong with this subscription. Try later');
      await user?.updateOne({ subscriptions: [...user.subscriptions, sub.id]});
      const userSubs = await helper(user.subscriptions);
      return send(201, 'Subscription confirmed', { confirmed: true, subscriptions: userSubs });
    }
  } catch (e: any) {
    console.log(e);
    send(500, e.message, { confirmed: false });
  }
});

router.post('/payment/sub/check', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');
    const { ids } = req.body;
    if (!ids || !(ids instanceof Array)) throw new Error('Subscriptions ids weren\'t provided');

    let subscriptions = [];
    for (const subId of ids) {
      subscriptions.push(new Promise(res => {
        res(stripe.subscriptions.retrieve(subId));
      }));
    }
    subscriptions = await Promise.all(subscriptions);

    const mapped = subscriptions.map((sub: any) => {
      sub.active = !sub.cancel_at_period_end;
      if (sub.status === 'canceled') sub.active = false;
      return sub;
    })
    return send(201, 'Subscriptions with statuses were got', { subscriptions: mapped });
  } catch (e: any) {
    console.log(e);
    send(500, e.message);
  }
});

router.post('/payment/sub/cancel', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');
    const { id } = req.body;

    if (!req.session.user) throw new Error('Something went wrong with the session');
    const user = await User.findById(req.session.user._id);
    if (!user) throw new Error('Something went wrong');

    const deleted = await stripe.subscriptions.del(id);
    if (deleted && deleted.id === id) {
      const index = user.subscriptions.find((sub: any) => sub.id === deleted.id);
      const subs = [...user.subscriptions.slice(0, index), ...user.subscriptions.slice(index)]
      await user.updateOne({ subscriptions: subs })
      return send(201, 'Your subscription was cancel successfully', { deleted, subscriptions: subs });
    }
  } catch (e: any) {
    console.log(e);
    send(500, e.message);
  }
});

export { router as profileRoutes };