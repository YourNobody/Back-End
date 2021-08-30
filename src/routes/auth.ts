import { routes } from '../constants/routes';
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { MyRequest, MyResponse } from '../interfaces/express.interface';

const router = Router();

//login
router.post(routes.AUTH.LOGIN, async (req: MyRequest, res: MyResponse) => {
  try {
    if (!req.body) {
      throw new Error('Somerthing went wrong!');
    }
    const {email, password} = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      const isSame = bcrypt.compareSync(password, candidate.password);

      if (isSame) {

      } else {
        return res.status(400).json({ message: 'Incorrect password or email' });
      }

    } else {
      return res.status(400).json({ message: 'Check for the password or email' });
    }
  } catch (error) {
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
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

export { router as authRoutes };
