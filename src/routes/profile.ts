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

router.post('/payment/sub', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');
    const {email, payment_method} = req.body;

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
      items: [{price: 'price_1JrVl1HGtSgh6m0CtuM9Y615'}],
      expand: ['latest_invoice.payment_intent']
    });
    const all = await stripe.prices.list();
    return send(500, '', {all})
    if (!subscription) throw new Error('Something went wrong with creating your subscription. Try later');
    else {
      //@ts-ignore
      const { plan: { status, interval, amount } } = subscription;

      return send(201, 'Client secret token created successfully', {
        status, interval, amount, success: status === 'active'
      });
    }

  } catch (e) {
    console.log(e.message);
    send(500, e.message, { success: false });
  }
});

export { router as profileRoutes };