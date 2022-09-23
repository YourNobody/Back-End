import {Model, Schema} from "mongoose";
import { Document } from 'mongoose';
import {IImageCommon} from "./Image.interface";

export interface IVariant {
  answer?: string;
  image?: IImageCommon;
	id?: string;
  _id?: Schema.Types.ObjectId | string;
}

export interface IQuizStatistic {
  amount: number;
  answer: string;
  users: Array<{
    nickname: string | null;
    email: string | null;
    isAnonymous: boolean;
  }>
}

export const QuizesTypes = {
  SA: 'sa', TA: 'ta', RA: 'ra', AB: 'ab'
};

export interface IQuizModel extends Model<IQuiz>{
  build: <T>(payload: Exclude<IQuiz, keyof Document>) => T & Document
}

export interface IQuizRequired {
  title: string;
  question: string;
  type: string;
  premium: boolean;
  quizAvatar: string;
  orderNumber: number;
  multiple?: boolean;
  userId: Schema.Types.ObjectId | string;
  createdAt?: Date;
}

export interface IQuizCommon extends IQuizRequired {
  answers: IAnswer[];
  images?: Schema.Types.ObjectId[];
  variants?: IVariant[];
}

export interface IQuiz extends IQuizCommon, Document {}

export interface IAnswerCommon {
  variantId?: Schema.Types.ObjectId | string;
  variantIds?: Schema.Types.ObjectId[] | string[];
  message?: string;
  answers?: {
    answer: string;
    variantId: string;
  }[];
  rating?: {
    rate: number;
    scale: number;
  };
  userId: Schema.Types.ObjectId | string;
  multiple?: boolean;
  _id?: string | Schema.Types.ObjectId;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export interface IAnswerFromFrontend {
  quizId: string;
  quizType: string;
  multiple?: boolean;
  answers?: {
    answer: string;
    variantId: string;
  }[];
  message?: string;
  rating?: {
    rate: number;
    scale: number;
  };
  variantId?: string;
}

export interface IAnswer extends IAnswerCommon {
}

export interface IQuizSA extends Omit<IQuiz, 'images'> {
  answers: Omit<IAnswer, 'message' | 'rating'>[];
  variants: Omit<IVariant, 'image'>[];
}

export interface IQuizTA extends Omit<IQuiz, 'images' | 'variants'> {
  answers: Omit<IAnswer, 'variantId' | 'rating'>[];
}

export interface IQuizRA extends IQuiz {
  answers: Omit<IAnswer, 'message' | 'variantId'>[];
}

export interface IQuizAB extends IQuiz {
  answers: Omit<IAnswer, 'message' | 'rating'>[];
  variants: Omit<IVariant, 'answer'>[];
}

export interface WithQuizTypeAndId {
  quizType: string;
  quizId: string;
}