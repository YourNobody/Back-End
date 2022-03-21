import {Document, Model, Schema} from "mongoose";

type IUserQuizes = {
  quizId: Schema.Types.ObjectId
};

export interface IUserCommon extends Document {
  nickname: string;
  email: string;
  password: string;
  quizzes: IUserQuizes[];
  isActivated: boolean;
  premium: boolean;
  activationLink: string;
  avatar: string;
  passwordChanged: Date;
  // subscriptions: {
  //   _id?: Schema.Types.ObjectId,
  //   sub: any;
  // }[];
};

export interface IUser extends Document, IUserCommon {}

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

export interface IRegisterBody {
  nickname: string;
  email: string;
  password: string;
  confirm: string;
}

export interface IRegisterCreateUser extends Omit<IRegisterBody, 'confirm'> {
  activationLink: string;
}

export interface IUserModel extends Model<IUser>{
  build: (data: Omit<IRegisterCreateUser, 'confirm'>) => IUser;
}

export interface IUserDTO extends IUserModel {
  email: string;
  _id: Schema.Types.ObjectId;
  nickname: string;
}

export type profileChangeTypes = 'password' | 'email' | 'nickname';