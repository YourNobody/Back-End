import { routes } from '../constants/routes';
import { Router } from 'express';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import { useSend } from '../helpers/send.helper';

const router = Router();

//logout
router.post(routes.PROFILE.LOGOUT, async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    req.session.destroy(err => {
      if (err) throw err;
      send(201, 'Logged out');
    })
  } catch (err) {
    send(400, err.message);
  }
});

export { router as profileRoutes };