import { Schema } from "mongoose";

export interface IAnswer {
  answer: string | number;
  userId?: Schema.Types.ObjectId; 
}

export interface IQuestion {
  question: string;
  type: QuestionTypes;
  answers: IAnswer[];
  userId: Schema.Types.ObjectId; 
};

export enum QuestionTypes {
  SA = 'SA', TA = 'TA', RA ='RA', AB ='AB'
};