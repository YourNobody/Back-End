import { Schema } from "mongoose";

type QuestionType = 'Select' | 'Text' | 'Rating' | 'A/B'; 

export interface IAnswer {
  answer: string | number;
  date: Date;
  type: QuestionType;
  userId?: Schema.Types.ObjectId; 
}

export interface IQuestion {
  question: string;
  answers: IAnswer[];
  date: Date;
  userId: Schema.Types.ObjectId; 
};