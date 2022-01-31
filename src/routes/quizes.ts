import { Router } from 'express';
import { User } from '../models/User';
import { MyRequest, MyResponse } from '../interfaces/express.interface';
import { useSend } from '../helpers/send.helper';
import { getPopulatedObject, withoutParameter } from '../helpers/data.helper';
import { Quiz } from '../models/Quiz';
import { quizesNames, __v, _id } from './../constants/app';
import { IQuiz, IQuizStatistic, QuizesTypes } from '../interfaces/Quiz.interface'
import { Schema } from 'mongoose';
import { IUserQuizCreator } from '../interfaces/User.interface';
const router = Router();

router.get('/', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.session.user) return send(400, 'Something went wrong');
    if (req.session.token) {
      if (req.session.user) {
        const user = await User.findById(req.session.user._id).populate('quizes.quizId');
        const quizzes = user?.quizes.reduce((acc, curr) => {
          if (!curr.quizId) return acc;
          //@ts-ignore
          const quiz: IQuiz = withoutParameter({...curr.quizId._doc}, '_id', 'id');
          quiz.quizAnswers.forEach(qa => {
            //@ts-ignore
            qa = withoutParameter(qa, _id, 'id') as typeof qa;
          })
          quiz.usersAnswers.forEach(ua => {
            //@ts-ignore
            ua = withoutParameter(ua, _id, 'id') as typeof ua;
          })
          //@ts-ignore
          delete quiz[__v];
          //@ts-ignore
          acc.push(quiz);
          return acc;
        }, []);
        
        return send(200, 'Your quizzes loaded successfully', { quizzes });
      }
    } else {
      return send(400, 'User isn\'t authenticated');
    }
  } catch (error: any) {
    console.log(error.message);
    send(500, error.message);
  }
});

router.post('/remove', async (req: MyRequest, res: MyResponse) => {
  const send = useSend(res);
  try {
    if (!req.body) throw new Error('Something went wrong');

    const { quizId } = req.body;

    if (req.session.token && req.session.user) {
      if (quizId) {
        await Quiz.findByIdAndDelete(quizId);
        return send(200, 'Quiz have been deleted successfully');
      }
    }

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
    if (req.session.token && req.session.user) {
      const quiz = await Quiz.findById(quizId).populate('usersAnswers.userId');
      
      if (quiz) {
        const { quizAnswers, usersAnswers } = quiz;
  
        const stats = quizAnswers.reduce((acc, curr): Record<string, IQuizStatistic> => {
          if (curr._id) {
            //@ts-ignore
            acc[curr?._id?.toString()] = {
              users: [],
              answer: curr.answer,
              amount: 0
            }
          }
          return acc;
        }, {} as Record<string, IQuizStatistic>);
  
        
        for (const UA of usersAnswers) {
          //@ts-ignore
          const stat = stats[UA?.quizAnswerId?.toString()];
          if (!stat) continue;
          stat.amount++;
          if (UA.userId) {
            stat.users.push({ isAnonymous: true, nickname: null, email: null });
          } else {
            //@ts-ignore
            stat.users.push({ isAnonymous: false, nickname: UA.userId?.nickname || null, email: UA.userId?.email || null})
          }
        }
  
        const statsFinal = Object.entries(stats).map(s => s[1]);
  
        return send(200, 'Statistics are loaded', { usersAnswers: statsFinal });
      }
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

    const { quizId, quizAnswerId, answer, type } = req.body;

    if (!quizId) throw new Error('Id of the Quiz wan\'t provided');

    const quiz = await Quiz.findById(quizId);

    if (!quiz) throw new Error('Something went wrong');

    switch (type.toUpperCase()) {
      case QuizesTypes.SA: {
        if (!quizAnswerId) throw new Error('Quiz Answer ID wasn\'t provided');

        const userAnswer = quiz.usersAnswers.find(qa => qa.userId?.toString() === req.session?.user?._id.toString());
        const quizAnswer = quiz.quizAnswers.find(qa => qa._id?.toString() === quizAnswerId.toString());

        if (!quizAnswer) throw new Error('No such answer on this Quiz');

        if (!!userAnswer && req.session?.user) {
          const index = quiz.usersAnswers.findIndex(qa => qa._id?.toString() === quizAnswerId.toString());
          const updated = [
            ...quiz.quizAnswers.slice(0, index),
            {
              ...userAnswer,
              answer: quizAnswer.answer,
              quizAnswerId,
            },
            ...quiz.quizAnswers.slice(index + 1),
          ];

          await quiz.updateOne({ usersAnswers: updated });

          return send(201, 'Your previous answer has been updated');
        } else {
          const newAnswer = {
            quizAnswerId,
            answer: quizAnswer.answer,
          } as any;
          if (req.session?.user && req.session?.user._id) {
            newAnswer.userId = req.session.user._id;
          }

          await quiz.updateOne({ usersAnswers: [...quiz.usersAnswers, newAnswer] })

          return send(201, 'Your answer has been added');
        }
      }
      case QuizesTypes.TA: {

      }
      case QuizesTypes.RA: {

      }
      case QuizesTypes.AB: {

      }
      default: throw new Error('Quiz type wasn\'t provided or can\'t be processed');
    }

    // if (quizId) {
    //   const quiz = await Quiz.findById(quizId);
    //   const quizAnswer = quiz?.quizAnswers.find(qa => qa._id?.toString() === quizAnswerId.toString());
    //   const newAnswer = { answer: quizAnswer?.answer, quizAnswerId: quizAnswer?._id } as {
    //     answer: string; quizAnswerId: Schema.Types.ObjectId, userId: Schema.Types.ObjectId | null; isAnonimous: boolean;
    //   };
    //
    //   if (!req.session?.user?._id) {
    //     newAnswer.userId = null;
    //     newAnswer.isAnonimous = true;
    //   } else {
    //     newAnswer.userId = req.session.user._id;
    //     newAnswer.isAnonimous = false;
    //   }
    //
    //   //@ts-ignore
    //   await quiz?.updateOne({ usersAnswers: [...quiz.usersAnswers, newAnswer] })
    //
    //   return send(200, 'Your answer have been saved');
    // } else {
    //   throw new Error('No Quiz ID');
    // }
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
    const type = req.body?.type?.toLowerCase();

    if (type) {
      const allQuizes = await Quiz.find({ type }).populate('userId');
      const quizes = allQuizes.map((q): IQuiz & IUserQuizCreator => {
        const creator = { nickname: null, email: null } as IUserQuizCreator;
        if (q.userId) {
          //@ts-ignore
          creator.nickname = q.userId.nickname; creator.email = q.userId.email;
        }
        //@ts-ignore
        const quiz = withoutParameter({...q._doc, creator}, _id, 'id') as IQuiz & IUserQuizCreator;
        
        //@ts-ignore
        return withoutParameter(withoutParameter(quiz, 'userId'), __v);
      });
      //@ts-ignore
      return send(201, quizesNames[type.toUpperCase()] + ' are loaded', { quizes });
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

    if (req.session.user && req.session.token) {
   //   if (req.session.token !== req.headers.authorization) {
   //     return send(400, 'Authorization failed')
   //   }

      const { _id: userId } = req.session.user._id;

      const quizAnswersToBD = quizAnswers ? quizAnswers.map((answer: string) => {
        return { answer };
      }) : null;

      const questionToBD = new Quiz({
        type, content, question, quizAnswers: quizAnswersToBD, userId: req.session.user?._id, title, usersAnswers: []
      });

      await questionToBD.save();

      const user = await User.findById(userId);

      if (user) {
        await user.updateOne({
          quizes: [...user.quizes, { quizId: questionToBD._id }]
        });
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

export { router as quizesRoutes };
