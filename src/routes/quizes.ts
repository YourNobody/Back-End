import { routes } from '../constants/routes';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import { useSend } from '../helpers/send.helper';
import { validateSession } from '../middlewares/validateSession';
import { getPopulatedObject } from '../helpers/payload.helper';
import { Quiz } from '../models/Quiz';
import { ANONYMOUS_NAME, quizesNames } from './../constants/app';
const router = Router();

router.get('/', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {    
    if (!req.session.user) return send(400, 'Something went wrong');
    if (req.session.token) {
      if (req.session.user) {
        const user = await User.findOne({ email: req.session.user.email });
        
        const quizesIds = user?.quizes;
        
        let quizes = [];
        if (quizesIds) {
          for (let quiz of quizesIds) {
            const single = await Quiz.findById(quiz.quizId);
            if (single) {
              quizes.push(single);
            }
          }
        }

        send(200, 'Your quizes loaded', { quizes });
      }

    } else {
      return send(400, 'User isn\'t authenticated');
    }
  } catch (error) {
    console.log(error);
    
  }
});

router.post('/remove', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');

    const { quizId } = req.body;

    if (quizId) {
      await Quiz.findByIdAndDelete(quizId);
    }

    send(200, 'Quiz have been deleted successfully');

  } catch (err: any) {
    console.error(err);
    send(500, err.message);
  }
});

router.get('/statistics', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.query) throw new Error('Query wasn\t provided');
    const { quizId } = req.query;

    if (!quizId) throw new Error('Quiz id wasn\t provided');
    const quiz = await Quiz.findById(quizId).populate('usersAnswers.userId');
    
    if (quiz) {
      const { quizAnswers, usersAnswers } = quiz;

      const stats = quizAnswers.reduce((acc, curr): any => {
        if (curr._id) {
          //@ts-ignore
          acc[curr?._id?.toString()] = {
            users: [],
            answer: curr.answer,
            amount: 0
          }
        }
        return acc;
      }, {});

      
      for (const UA of usersAnswers) {
        //@ts-ignore
        const stat = stats[UA?.quizAnswerId?.toString()];
        if (!stat) continue;
        stat.amount++;
        if (UA.isAnonimous) {
          stat.users.push({ isAnonimous: true, nickname: null, email: null });
        } else {
          //@ts-ignore
          stat.users.push({ isAnonimous: false, nickname: UA.userId?.nickname || null, email: UA.userId?.email || null})
        }
      }

      const statsFinal = Object.entries(stats).map(s => s[1]);

      return send(200, 'Statistics are loaded', { usersAnswers: statsFinal });
    }

  } catch (error: any) {
    console.error(error);
    send(500, error.message);
  }
})

router.post('/save', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');

    const { quizId, quizAnswerId } = req.body;

    if (quizId) {
      const quiz = await Quiz.findById(quizId);
      const quizAnswer = quiz?.quizAnswers.find(qa => qa._id?.toString() === quizAnswerId.toString());
      const newAnswer: any = { answer: quizAnswer?.answer, quizAnswerId: quizAnswer?._id };

      if (!req.session?.user?._id) {
        newAnswer.userId = null;
        newAnswer.isAnonimous = true;
      } else {
        newAnswer.userId = req.session.user._id;
      }

      //@ts-ignore
      await quiz?.update({ usersAnswers: [...quiz.usersAnswers, newAnswer] })

      await quiz?.save();

      return send(200, 'Your answer have been saved');
    }

    throw new Error('Something went wrong'); 
  } catch (err: any) {
    console.error(err);
    send(500, err.messsage);
  }
});

//get quiz according to a quiz type
router.post('/', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) {
      throw new Error('Something went wrong');
    }
    const { type } = req.body;

    if (type) {
      const quizes = await Quiz.find({ type });
      let quizesWithPopulatedUser = [];
      for (let quiz of quizes) {
        const user = await User.findById(quiz.userId);
        //@ts-ignore
        const populated = { ...quiz._doc, creator: {
          nickname: user?.nickname,
          email: user?.email
        }};
        //@ts-ignore
        delete populated.userId;
        quizesWithPopulatedUser.push(populated);
      }

      const populatedQuizes = quizes.map(q => {        
        return getPopulatedObject(q, '_id:id question type questionAnswers usersAnswers title');
      });

      if (quizes) {
        //@ts-ignore
        return send(201, quizesNames[type.toUpperCase()] + ' are loaded', { quizes: quizesWithPopulatedUser });
      }

    } else {
      throw new Error('Types isn\'t provided');
    }
  } catch (error: any) {
    console.error(error);
    send(500, error.message);
  }
});

//create quiz
router.post('/create', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) {
      throw new Error('Somerthing went wrong!');
    }
    
    const { type, quizAnswers, title, question, content } = req.body;

    if (req.session.user && req.session.token && req.headers.authorization) {
      if (req.session.token !== req.headers.authorization) {
        return send(400, 'Authorization failed')
      }

      const { _id: userId } = req.session.user._id;

      const quizAnswersToBD = quizAnswers.map((answer: string) => {
        return { answer };
      });

      const questionToBD = new Quiz({
        type, content, question, quizAnswers: quizAnswersToBD, userId: req.session.user?._id, title, usersAnswers: []
      });

      await questionToBD.save();

      const user = await User.findById(userId);
      
      if (user) {
        await user.update({
          quizes: [...user.quizes, { quizId: questionToBD._id }]
        });
        
        await user.save();
      }

      return send(201, 'Question created successfully!');
    } else {
      send(400, 'User isn\'t authenticated. Please log in to add a question');
    }
  } catch (error: any) {
    send(500, error.message);
    console.error(error);
  }
});

//remove quiz
router.post(routes.QUIZES.REMOVE, validateSession, async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.query) {
      throw new Error('Somerthing went wrong!');
    }
    const { question_id } = req.query;

    if (req.session.user && req.session.token) {}
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

export { router as quizesRoutes };
