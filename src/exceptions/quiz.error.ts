export class QuizError extends Error {
	status: number;
	errors: any[];

	constructor(status: number, message: string, errors: any = []) {
		super(message);
		this.status = status;
		this.errors = errors;
	}

	static BadRequest(message: string, errors: any[] = []) {
		return new QuizError(400, message, errors);
	}
}