import { Schema } from "mongoose";

export interface IUserAnswer {
  answer: string | number;
  userId?: Schema.Types.ObjectId; 
}

export interface IQuiz {
  question: string;
  type: QuizesTypes;
  title: string;
  quizAnswers: string[];
  usersAnswers: IUserAnswer[];
  userId: Schema.Types.ObjectId;
};

export enum QuizesTypes {
  SA = 'SA', TA = 'TA', RA ='RA', AB ='AB'
};