import { Schema } from "mongoose";

export interface IAnswer {
  answer: string | number;
  date: Date;
  userId: Schema.Types.ObjectId; 
}

export interface IQuestion {
  question: string;
  answers: IAnswer[];
  date: Date;
};