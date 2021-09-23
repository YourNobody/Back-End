import { Schema } from "mongoose";

type IUserQuizes = {
  quizId: Schema.Types.ObjectId
};

export interface IUser {
  nickname: string;
  email: string;
  password: string;
  quizes: IUserQuizes[];
};