import { Router, Request, Response } from "express";

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send({ success: 'Home route loaded successfully' });
});

export { router as homeRoutes };