import { Response } from 'express';

export const useSend = (res: Response) => {
  return (status: number, message?: string | Record<string, unknown>, params?: Record<string, unknown>): void => {
    res.status(status).json({
      message,
      ...params
    });
  }
};