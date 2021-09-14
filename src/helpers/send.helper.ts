import { Response } from 'express';

export const useSend = (res: Response) => {
  return (status: number, message?: string, params?: Record<string, unknown>) => {
    res.status(status).json({
      message,
      ...params
    });
  }
};