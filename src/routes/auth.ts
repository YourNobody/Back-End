import { routes } from '../constants/routes';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models/User';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import jwt from 'jsonwebtoken';
import { useSend } from '../helpers/send.helper';
import { getHashedPassword, getPopulatedObject, withoutParameter } from '../helpers/data.helper'
import { _id, QUERY_RESET_TOKEN } from '../constants/app';
import { sendResetEmail } from '../emails/sendResetEmail';

const router = Router();
//login
router.post(routes.AUTH.LOGIN, async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) {
      throw new Error('Somerthing went wrong!');
    }
    const {email, password} = req.body;
    const candidate = await User.findOne({ email }, 'email _id nickname password');

    if (candidate) {
      const isSame = bcrypt.compareSync(password, candidate.password);

      if (isSame) {
        req.session.user = candidate;
        
        const token = jwt.sign({
          userId: candidate?._id,
          expiresIn: 1000 * 60 * 60,
          expiresAt: Date.now() + 1000 * 60 * 60,
          algorithm: 'RS256'
        }, process.env.JWT_SECRET as string);

        req.session.token = token;

        req.session.save((err) => {
          if (err) {
            console.log(err);
            throw new Error('Session error, please try again');
          }
          return send(201, '', {
            token,
            //@ts-ignore
            user: withoutParameter(withoutParameter({...candidate._doc}, 'password'), _id, 'id'),
            message: 'Successful Log In',
          })
        })
        return;
      } else {
        return send(400, 'Incorrect password or email');
      }

    } else {
      return send(400, 'Check for the password or email');
    }
  } catch (error: any) {
    send(500, error.message);
    console.error(error);
  }
});

//register
router.post(routes.AUTH.REGISTER, async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) {
      throw new Error('Somerthing went wrong!');
    }
    const {email, password, confirm, nickname} = req.body;
    
    if (password !== confirm) {
      send(400, 'Paaswords don\'t match');
    }

    const candidateByEmail = await User.findOne({ email });
    const candidateByNickname = await User.findOne({ nickname });

    if (candidateByNickname) {
      return send(400, 'User with such the Nickname is already exists');
    }
    if (candidateByEmail) {
      return send(400, 'User with such the email already exists');
    } else {
      if (password !== confirm) {
        return send(400, 'Confirmation failed');
      }
      const hashedPassword = getHashedPassword(password, 10);
      const user = new User({
        email, nickname,
        password: hashedPassword,
        quizes: []
      });

      await user.save();

      return send(201, 'Registration has gone successully');
    }
  } catch (error: any) {
    send(500, error.message);
    console.error(error);
  }
});

router.post('/logout', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    await req.session.destroy(err => {
      if (err) {
        console.error(err);
        throw err;
      }
    })
    return send(201, 'Logged out');
  } catch (err: any) {
    send(400, err.message);
    console.error(err.message);
  }
});

router.post('/check', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');
    if (!req.session || !req.session.token) {
      return send(201, 'User session expired', { isAuthenticated: false });
    }

    const { token } = req.body;
    if (req.session.token === token) {
      return send(201, 'User session still exists', { isAuthenticated: true });
    } else {
      req.session.destroy(err => {
        if (err) throw err;
      })
      return send(201, 'User session expired', { isAuthenticated: false });
    }
  } catch (err: any) {
    send(500, err.message);
    console.log(err);
  }
});

router.post('/reset', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (req.query && req.query[QUERY_RESET_TOKEN]) {
      if (!req.body) throw new Error('Reset data wasn\'t provided');
      const { password, confirm } = req.body;
      if (!password || !confirm) throw new Error('New password or its confirmation wasn\'t provided');
      if (password !== confirm) throw new Error('Password wan\'t confirmed');
      const resetToken = req.query[QUERY_RESET_TOKEN] as string;

      const user = await User.findOne({ resetToken });

      const hashedPassword = getHashedPassword(password, 10);

      if (user && hashedPassword) {
        await user.updateOne({ password: hashedPassword });
        return send(201, 'Password has been changed successfully');
      } else throw new Error('Something went wrong');
    } else {
      if (!req.body) return send(500, 'Something went wrong');
      const { email } = req.body;
      if (!email) return send(405, 'Eamil isn\'t provided');
      if (email) {
        const token = await new Promise<string | null>(res => {
          crypto.randomBytes(32, (err, buff) => {
            if (!err) return res(buff.toString('hex'));
            return res(null);
          })
        });
        if (!token) return send(500, 'Something went wrong with tokenization');

        const user = await User.findOne({ email });
        if (user) {
          user.resetToken = token;
          user.resetTokenExp = new Date(Date.now() + 1000 * 60 * 15);

          await user.save();
          try {
            await sendResetEmail(email, token);
            return send(201, `The email has been sent to this email ${email}`);
          } catch (error) {
            return send(405, 'Email sending error');
          }
        }

        return send(404, `User with such the email doesn't exist on ${process.env.APP_NAME}`);
      }
    }
  } catch (err) {
    console.log(err);
  }
});

router.get('/reset', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.query) throw new Error('Something went wrong');
    const resetToken = req.query[QUERY_RESET_TOKEN] as string;
    if (!resetToken) throw new Error('No reset token. Access denied');

    const user = await User.findOne({ resetToken });
    if (!user) throw new Error('No users with this token');
    const { resetTokenExp } = user;
    if (resetTokenExp && Date.now() > new Date(resetTokenExp).getTime()) {
      return send(400, 'Your reset token has expired');
    }
    return send(200, 'Access approved', { isAccessed: true });
  } catch (err: any) {
    send(500, err.message);
    console.log(err);
  }
});

export { router as authRoutes };
