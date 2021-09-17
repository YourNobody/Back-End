import { IQuestion } from "./Question.interface";

export interface IUser {
  nickname: string;
  email: string;
  password: string;
  questions: IQuestion[];
};