import { Schema } from "mongoose";

export interface IUserAnswer {
  answer: string | number;
  userId?: Schema.Types.ObjectId;
  _id?: Schema.Types.ObjectId;
  id?: Schema.Types.ObjectId;
  createdAt?: Date,
  updatedAt?: Date,
  quizAnswerId?: Schema.Types.ObjectId
}

export interface IQuizAnswer {
  answer: string;
  _id?: Schema.Types.ObjectId;
  id?: Schema.Types.ObjectId;
}

export interface IQuiz {
  question: string;
  type: QuizesTypes;
  title: string;
  quizAnswers: IQuizAnswer[];
  usersAnswers: IUserAnswer[];
  userId: Schema.Types.ObjectId;
  _id?: Schema.Types.ObjectId;
  id?: Schema.Types.ObjectId;
};

export interface IQuizStatistic {
  amount: number;
  answer: string;
  users: Array<{
    nickname: string | null;
    email: string | null;
    isAnonymous: boolean;
  }>
}

export enum QuizesTypes {
  SA = 'SA', TA = 'TA', RA ='RA', AB ='AB'
};