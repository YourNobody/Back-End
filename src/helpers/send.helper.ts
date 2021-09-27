import { Response } from 'express';

export const useSend = (res: Response) => {
  return function send(status: number, message?: string | Record<string, unknown>, params?: Record<string, unknown>): void {
    if (arguments.length === 3) {
      res.status(status).json({
        message,
        ...params
      })
    }
    if(arguments.length < 3) {
      if (message instanceof Object) {
        res.status(status).json({ ...message })
      }
    }
  }
};