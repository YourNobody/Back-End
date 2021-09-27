import { routes } from '../constants/routes';
import { Router } from 'express';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import { useSend } from '../helpers/send.helper';

const router = Router();

export { router as profileRoutes };