import {Error} from "mongoose";

export class ApiError extends Error {
	status: number;
	errors: any[];

	constructor(status: number, message: string, errors: any = []) {
		super(message);
		this.status = status;
		this.errors = errors;
	}

	static UnauthorizedError() {
		return new ApiError(401, 'User is unauthorized');
	}

	static BadRequest(message: string, errors: any[] = []) {
		return new ApiError(400, message, errors);
	}

	static NonActivated() {
		return new ApiError(400, 'This account is non-activated. We sent new activation link on this email');
	}

	static PasswordsAreIncomparable() {
		return new ApiError(400, `Passed password isn't equal to this account`);
	}
}