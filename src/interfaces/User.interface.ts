import { Schema } from "mongoose";

type IUserQuizes = {
  quizId: Schema.Types.ObjectId
};

export interface IUser {
  nickname: string;
  email: string;
  password: string;
  quizes: IUserQuizes[];
  resetToken?: string;
  resetTokenExp?: Date;
  mySubscriptions?: string[];
  _id?: Schema.Types.ObjectId;
  id?: Schema.Types.ObjectId
};

export interface IUserQuizCreator {
  nickname: string | null;
  email: string | null;
}

export interface IChangeNickname {
  nickname: string;
}

export interface IChangeEmail {
  email: string;
}

export interface IChangePassword {
  oldPassword: string;
  password: string;
  confirm: string;
}

export type profileChangeTypes = 'password' | 'email' | 'nickname';