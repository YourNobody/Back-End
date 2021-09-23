import { Schema } from "mongoose";

export interface IUserAnswer {
  answer: string | number;
  userId?: Schema.Types.ObjectId; 
  _id?: Schema.Types.ObjectId
}

export interface IQuizAnswer {
  answer: string;
  _id?: Schema.Types.ObjectId
}

export interface IQuiz {
  question: string;
  type: QuizesTypes;
  title: string;
  quizAnswers: IQuizAnswer[];
  usersAnswers: IUserAnswer[];
  userId: Schema.Types.ObjectId;
};

export enum QuizesTypes {
  SA = 'SA', TA = 'TA', RA ='RA', AB ='AB'
};