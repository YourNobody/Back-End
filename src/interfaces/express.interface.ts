import { Request, Response } from 'express';
import session, { SessionData } from 'express-session';

export interface MyRequest extends Request {
  session: session.Session & Partial<SessionData> & MySession;
}

export interface MyResponse extends Response {

}

export interface MySession extends SessionData {
  isAuthenticated?: boolean;
}