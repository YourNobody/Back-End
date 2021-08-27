import { IQuestion } from "./Question.interface";

export interface IUser {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  questions: IQuestion[];
};