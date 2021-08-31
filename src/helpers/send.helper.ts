import { Response } from 'express';

export const send = (res: Response) => {
  return (status: number, message?: string, params?: Record<string, unknown>) => {
    res.send(status).json({
      message,
      ...params
    });
  }
};