import { Schema } from "mongoose";

type IUserQuizes = {
  quizId: Schema.Types.ObjectId
};

export interface IUser {
  nickname: string;
  email: string;
  password: string;
  quizes: IUserQuizes[];
  _id?: Schema.Types.ObjectId;
  id?: Schema.Types.ObjectId
};

export interface IUserQuizCreator {
  nickname: string | null;
  email: string | null;
}