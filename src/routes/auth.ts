import { routes } from '../constants/routes';
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { validateSession } from '../middlewares/validateSession';
import { MyRequest, MyResponse } from '../interfaces/express.interface';

const router = Router();

//login
router.get(routes.AUTH.LOGIN, validateSession, (req: MyRequest, res: MyResponse) => {
  try {
    res.status(200).json({ message: 'Login page is loaded successfully' });
  } catch (error) {
    console.error(error)
  }
});

router.post(routes.AUTH.LOGIN, validateSession, async (req: MyRequest, res: MyResponse) => {
  try {
    if (req.body) {
      throw new Error('Somerthing went wrong!');
    }
    const {email, password} = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      const isSame = bcrypt.compareSync(password, candidate.password);

      if (isSame) {

      } else {
        res.status(400).json({ message: 'Incorrect password or email' });
      }

    } else {
      res.status(400).json({ message: 'Incorrect password or email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

//register
router.get(routes.AUTH.REGISTER, validateSession, (req: MyRequest, res: MyResponse) => {
  try {
    res.status(200).json({ message: 'Register page is loaded successfully' });
  } catch (error) {
    console.error(error)
  }
});

router.post(routes.AUTH.REGISTER, validateSession, async (req: MyRequest, res: MyResponse) => {
  try {
    if (req.body) {
      throw new Error('Somerthing went wrong!');
    }
    const {email, password} = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      res.status(400).json({ message: 'User with such the email already exists' })
    } else {
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
