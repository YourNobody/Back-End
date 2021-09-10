import { Request, Response } from 'express';
import session, { SessionData } from 'express-session';
import { IUser } from './User.interface';
import { Document } from 'mongoose';

export interface MyRequest extends Request {
  session: session.Session & Partial<SessionData> & MySession;
}

export interface MyResponse extends Response {

}

export interface MySession extends SessionData {
  isAuthenticated?: boolean;
  user?: (Document<any, any, IUser> & IUser) | null
  ;
}