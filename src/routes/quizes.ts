import { routes } from '../../../Back-End/src/constants/routes';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../../../Back-End/src/models/User';
import { MyRequest, MyResponse } from '../../../Back-End/src/interfaces/express.interface';
import { useSend } from '../../../Back-End/src/helpers/send.helper';
import { validateSession } from '../../../Back-End/src/middlewares/validateSession';
import { Question } from '../../../Back-End/src/models/Question';
import { getPopulatedObject } from '../../../Back-End/src/helpers/payload.helper';
const router = Router();

router.post('/', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) {
      throw new Error('Something went wrong');
    }
    const { type } = req.body;

    if (type) {
      const questions = await Question.find({ type });   
      const populatedQuestions = questions.map(q => {        
        return getPopulatedObject(q, '_id:id question type questionAnswers usersAnswers title');
      });

      if (questions) {
        return send(201, 'Questions loaded', { questions: questions });
      }

    } else {
      throw new Error('Types isn\'t provided');
    }
  } catch (error: any) {
    console.error(error);
    send(500, error.message);
  }
});

router.post('/create', async (req: MyRequest, res: MyResponse) => {
  console.log(req.body);
  const send = useSend(res);
  try {
    if (!req.body) {
      throw new Error('Somerthing went wrong!');
    }
    
    const { type, questionAnswers, title, question, content } = req.body;

    if (req.session.user && req.session.isAuthenticated) {
      const questionAnswersToBD = questionAnswers.map((answer: string) => {
        return { answer };
      });
      const questionToBD = new Question({
        type, content, question, questionAnswers: questionAnswersToBD, userId: req.session.user?._id, title, usersAnswers: []
      });

      await questionToBD.save();

      return send(201, 'Question created successfully!');
    } else {
      send(400, 'User isn\'t authenticated. Please log in to add a question');
    }
  } catch (error: any) {
    send(500, error.message);
    console.error(error);
  }
});

//remove question
router.post(routes.QUIZES.REMOVE, validateSession, async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.query) {
      throw new Error('Somerthing went wrong!');
    }
    const { question_id } = req.query;

    if (req.session.user && req.session.isAuthenticated) {}
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

export { router as quizesRoutes };
