import { routes } from '../constants/routes';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import jwt from 'jsonwebtoken';
import { useSend } from '../helpers/send.helper';
import { getPopulatedObject } from '../helpers/payload.helper';

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
        req.session.isAuthenticated = true;

        req.session.save((err) => {
          if (err) throw new Error('Session error, please try again');
        })

        const token = jwt.sign({
          userId: candidate?._id,
          expiresIn: 1000 * 60 * 60,
          expiresAt: Date.now() + 1000 * 60 * 60,
          algorithm: 'RS256'
        }, process.env.JWT_SECRET as string);
        
        res.status(201).json({
          token,
          user: getPopulatedObject(candidate, '_id:id email nickname'),
          message: 'Successful Log In', isAuthenticated: true
        })
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
        questions: []
      });

      await user.save();

      return send(201, 'Registration has gone successully', {
        user: candidateByEmail
      });
    }
  } catch (error: any) {
    send(500, error.message);
    console.error(error);
  }
});

export { router as authRoutes };
