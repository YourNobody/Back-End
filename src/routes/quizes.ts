import { routes } from '../constants/routes';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import { useSend } from '../helpers/send.helper';
import { validateSession } from './../middlewares/validateSession';
import { Question } from '../models/Question';
import { getPopulatedObject } from '../helpers/payload.helper';
const router = Router();
//add question

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
        return getPopulatedObject(q, 'question type answers');
      });
      
      if (questions) {
        return send(201, 'Questions loaded', { questions: questions });
      }

    } else {
      throw new Error('Types isn\'t provided');
    }
  } catch (error) {
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
    const { type, answers, question } = req.body;

    if (req.session.user && req.session.isAuthenticated) {
      console.log('DATA: ', type, question, answers, req.session.user._id);
      const answersToBD = answers.map((answer: string) => {
        return {
          answer, userId: req.session.user?._id
        }
      });
      const questionToBD = new Question({
        type, question, answers: answersToBD, userId: req.session.user?._id
      });

      await questionToBD.save();

      return send(201, 'Question created successfully!');
    } else {
      send(400, 'User isn\'t authenticated. Please log in to add a question');
    }
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

export { router as quizesRoutes };
