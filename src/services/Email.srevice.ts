import { google, Auth } from "googleapis";
import nodemailer from "nodemailer";

class EmailServiceClass {
	private _accessToken: any;
	private _oAuth2Config: any;
	private _transport: any;
	get accessToken(): any {
		return this._accessToken;
	}
	set accessToken(value: any) {
		this._accessToken = value;
	}
	set oAuth2Config(value: any) {
		this._oAuth2Config = value;
	}
	get oAuth2Config(): any {
		return this._oAuth2Config;
	}
	get transport(): any {
		return this._transport;
	}
	set transport(value: any) {
		this._transport = value;
	}

	constructor() {
		const self = this;
		try {
			void async function() {
				const oAuth2Client = new google.auth.OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET, process.env.OAUTH_REDIRECT_URI);
				oAuth2Client.setCredentials({refresh_token: process.env.OAUTH_REFRESH_TOKEN});

				self.oAuth2Config = await self.setAccessToken(oAuth2Client);
				self.transport = nodemailer.createTransport(self.oAuth2Config);
			}();
		} catch (e) {
			throw e;
		}
	}

	private async setAccessToken(oAuth2Client: Auth.OAuth2Client): Promise<any> {
		try {
			this.accessToken = await oAuth2Client.getAccessToken();

			return {
				service: 'gmail',
				auth: {
					type: 'OAuth2',
					user: process.env.OAUTH_EMAIL_FROM,
					clientId: process.env.OAUTH_CLIENT_ID,
					clientSecret: process.env.OAUTH_CLIENT_SECRET,
					refreshToken: process.env.OAUTH_REFRESH_TOKEN,
					accessToken: this.accessToken,
				}
			};
		} catch (err) {
			console.error(err);
		}
	}

	async sendActivationEmail(emailTo: string, token: string) {
		try {
			const template = this.getActivationEmailTemplate(emailTo, token);
			const result = await this.transport.sendMail(template);
			return result;
		} catch (e) {
			throw e;
		}
	}

	async sendResetEmail(emailTo: string, token: string) {
		try {
			const template = this.getResetEmailTemplate(emailTo, token);
			const result = await this.transport.sendMail(template);
			return result;
		} catch (e) {
			throw e;
		}
	}

	private getResetEmailTemplate(emailTo: string, resetToken: string) {
		return {
			to: emailTo,
			from: process.env.AUTH_EMAIL_FROM && process.env.AUTH_EMAIL_FROM.toUpperCase() + `<${process.env.OAUTH_EMAIL_FROM}>`,
			subject: 'Password Reset',
			html: `
	      <h2>Password reset process on ${process.env.APP_NAME}</h2>
	      <p>In order to reset the password you should follow the
	        <a href=${process.env.APP_BASE_URL + '/auth/reset/' + resetToken}>link</a
	       </p>
	      <hr />
	      <a href=${process.env.BASE_URL}>Quiz App</a>
	    `
		};
	}

	private getActivationEmailTemplate(emailTo: string, activationToken: string) {
		return {
			to: emailTo,
			from: process.env.AUTH_EMAIL_FROM && process.env.AUTH_EMAIL_FROM.toUpperCase() + `<${process.env.OAUTH_EMAIL_FROM}>`,
			subject: 'Password Reset',
			html: `
	      <h2>Account activation on ${process.env.APP_NAME}</h2>
	      <p>To activate your account click the
	        <a href=${process.env.APP_BASE_URL + '/auth/activate/' + activationToken}>link</a
	      </p>
	      <hr />
	      <a href=${process.env.BASE_URL}>Quiz App</a>
	    `
		};
	}
}

const emailService = new EmailServiceClass();
export { emailService as EmailService };