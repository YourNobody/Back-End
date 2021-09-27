import { Schema } from "mongoose";

export interface IUserAnswer {
  answer: string | number;
  userId?: Schema.Types.ObjectId; 
}

export interface IQuestion {
  question: string;
  type: QuestionTypes;
  title: string;
  content?: string;
  questionAnswers: string[];
  usersAnswers: IUserAnswer[];
  userId: Schema.Types.ObjectId; 
};

export enum QuestionTypes {
  SA = 'SA', TA = 'TA', RA ='RA', AB ='AB'
};