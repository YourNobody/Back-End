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
    const candidate = await User.findOne({ email }, 'email _id firstName lastName questions password');

    if (candidate) {
      const isSame = bcrypt.compareSync(password, candidate.password);

      if (isSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;

        req.session.save((err) => {
          if (err) throw new Error('Session error, please try again');
        })

        const token = jwt.sign(
          { userId: candidate?._id },
          process.env.JWT_SECRET as string,
          { expiresIn: '1d' }
        );
        
        res.status(201).json({
          token,
          user: getPopulatedObject(candidate, '_id:id email firstName lastName'),
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
  try {
    if (!req.body) {
      throw new Error('Somerthing went wrong!');
    }
    const {email, password, confirm} = req.body;

    if (password !== confirm) {
      res.status(400).json({ message: 'Paaswords don\'t match' })
    }

    const candidate = await User.findOne({ email });

    if (candidate) {
      return res.status(400).json({ message: 'User with such the email already exists' });
    } else {
      if (password !== confirm) {
        return res.status(400).json({ message: 'Confirmation failed' });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = new User({
        email, password: hashedPassword,
        questions: []
      });

      await user.save();

      res.status(201).json({ user: candidate, message: 'Registration has gone successully' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

export { router as authRoutes };
