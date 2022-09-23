import { Request, Response } from 'express';
import {IUser, IToken, IUserCommon} from '@Interfaces';
import {Document, Schema} from 'mongoose';
import {JwtPayload} from "jsonwebtoken";

export interface MyRequest<T> extends Request {
  user?: IUserCommon & JwtPayload,
  body: T
}

export interface MyResponse extends Response {

}