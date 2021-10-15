import { QUERY_RESET_TOKEN } from '../../constants/app';

const setResetTemplate = (emailTo: string, resetToken: string) => {
  return {
    to: emailTo,
    from: process.env.AUTH_EMAIL_FROM && process.env.AUTH_EMAIL_FROM.toUpperCase() + `<${process.env.OAUTH_EMAIL_FROM}>`,
    subject: 'Password Reset',
    html: `
      <h2>Password reset process on ${process.env.APP_NAME}</h2>
      <p>!The link below will be available only for 15 mins after sending</p>
      <p>In order to reset the password you should follow the
        <a href=${process.env.APP_BASE_URL + '/auth/reset/' + resetToken}>link</a
       </p>
      <hr />
      <a href=${process.env.BASE_URL}>Quiz App</a>
    `
  }
};

export default setResetTemplate;