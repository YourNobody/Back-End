import { routes } from '../constants/routes';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import jwt from 'jsonwebtoken';
import { useSend } from '../helpers/send.helper';
import { getPopulatedObject, withoutParameter } from '../helpers/data.helper';
import { _id } from '../constants/app';

const router = Router();
//login
router.post(routes.AUTH.LOGIN, async (req: MyRequest, res: MyResponse) => {
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
          return res.status(201).json({
            token,
            //@ts-ignore
            user: withoutParameter(withoutParameter({...candidate._doc}, 'password'), _id, 'id'),
            message: 'Successful Log In',
          })
        })
        return;
      } else {
        return res.status(400).json({ message: 'Incorrect password or email' });
      }

    } else {
      return res.status(400).json({ message: 'Check for the password or email' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
      const hashedPassword = bcrypt.hashSync(password, 10);
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
    console.error(err.message)
    send(400, err.message);
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
    console.log(err);
    send(500, err.message)
  }
});

export { router as authRoutes };
