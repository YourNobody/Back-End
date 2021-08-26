import { NextFunction } from "express";
import session, { SessionData } from 'express-session';
import { MyRequest, MyResponse } from "../interfaces/express.interface";

export function validateSession(req: MyRequest, res: MyResponse, next: NextFunction) {
  if (!req.session.isAuthenticated) {
    res.status(401).json({
      message: 'User is authenticated'
    });
  }
}