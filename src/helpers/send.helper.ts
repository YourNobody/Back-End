import {MyResponse} from "../interfaces/express.interface";

export const useSend = (res: MyResponse) => {
  return (status: number, message?: string | Record<string, unknown>, params?: Record<any, any>): void => {
    res.status(status).json({
      message,
      ...params
    });
  }
};

// export const useStaticSend = (res: MyResponse) => {
//   const obj = new WeakMap() as any;
//
//   obj.add(res);
//
//   return (status: number, message?: string | Record<string, unknown>, params?: Record<any, any>): void => {
//     res.status(status).json({
//       message,
//       ...params
//     });
//   }
// };