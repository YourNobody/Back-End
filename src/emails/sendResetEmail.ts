import nodemailer from 'nodemailer';
import transportConfig from './transportConfig';
import setResetTemplate from './templates/reset';

export const sendResetEmail = async (emailTo: string, token: string) => {
  try {
    //@ts-ignore
    const transport = nodemailer.createTransport(transportConfig);
    const regConfig = setResetTemplate(emailTo, token);
    const result = await transport.sendMail(regConfig);
    return result;
  } catch (err) {
    return err;
  }
};