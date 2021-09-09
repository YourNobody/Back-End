// import { routes } from '../constants/routes';
// import { Router } from 'express';
// import bcrypt from 'bcrypt';
// import { User } from '../models/User';
// import { MyRequest, MyResponse } from '../interfaces/express.interface';
// import { useSend } from '../helpers/send.helper';
// import { validateSession } from './../middlewares/validateSession';
// import { Question } from 'models/Question';
// import { useSend } from '../helpers/send.helper';

// const router = Router();
// //add question
// router.post(routes.QUIZES.ADD, validateSession, async (req: MyRequest, res: MyResponse) => {
//   const send = useSend(res);
//   try {
//     if (!req.query) {
//       throw new Error('Somerthing went wrong!');
//     }
//     const { qType, question } = req.query;

//     if (req.session.user && req.session.isAuthenticated) {
//       const questionToBD = new Question({
//         type: qType, question, answers: [], userId: req.session.user._id
//       });

//       await questionToBD.save();
//     } else {
//       send(400, 'User isn\'t authenticated. Please log in to add a question');
//     }
//   } catch (error) {
//     send(500, error.message);
//     console.error(error);
//   }
// });

// //remove question
// router.post(routes.QUIZES.REMOVE, validateSession, async (req: MyRequest, res: MyResponse) => {
//   const send = useSend(res);
//   try {
//     if (!req.query) {
//       throw new Error('Somerthing went wrong!');
//     }
//     const { question_id } = req.query;

//     if (req.session.user && req.session.isAuthenticated) {}
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//     console.error(error);
//   }
// });

// export { router as authRoutes };
