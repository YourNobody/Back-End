import {body} from "express-validator";

class ValidationFieldsAndMessages {
	protected email = 'email';
	protected password = 'password';
	protected confirm = 'confirm';
	protected nickname = 'confirm';
	protected title = 'confirm';
	protected answers = 'confirm';

	protected messages = {
		email: {
			emailInvalid: 'Incorrect email sent',
			emailExists: 'Such email exists',
		},
		password: {
			passwordInvalid: (minLength: number) =>  `Incorrect password sent. Should be more than ${minLength} symbols`,
		},
		confirm: {
			confirmInvalid: 'Password confirmation failed'
		},
		nickname: {
			nicknameInvalid: (minLength: number) =>  `Incorrect nickname sent. Should be more than ${minLength} symbols`,
		}
	};
}


class ValidationClass extends ValidationFieldsAndMessages {
	constructor() {
		super();
	}

	validateOnRegistration() {
		const { messages } = this;
		return [
			body(this.email).isEmail().withMessage(messages.email.emailInvalid).normalizeEmail().trim(),
			body(this.password).isLength({min: 5}).withMessage(messages.password.passwordInvalid(5)).trim(),
			body(this.confirm).custom((value, {req}) => {
				if (value !== req.body.password) {
					throw new Error(messages.confirm.confirmInvalid);
				}
				return true
			}).trim(),
			body(this.nickname).isLength({min: 4}).withMessage(messages.nickname.nicknameInvalid(4)).trim()
		];
	}

	validateOnLogin() {
		const { messages } = this;
		return [
			body(this.email).isEmail().withMessage(messages.email.emailInvalid).normalizeEmail().trim(),
			body(this.password).isLength({min: 5}).withMessage(messages.password.passwordInvalid(5)).trim(),
		];
	}
}

const validation = new ValidationClass();
export { validation as Validation };