import {MyRequest, MyResponse} from "../interfaces/express.interface";
import {QuizError} from "../exceptions/quiz.error";
import {QuizService} from "../services/Quiz.service";
import {useSend} from "../helpers/send.helper";
import {ApiError} from "../exceptions/api.error";
import {IAnswerCommon, IAnswerFromFrontend, WithQuizTypeAndId} from "../interfaces/Quiz.interface";

export class QuizController {
	static async createQuiz(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.params || !req.params.type) throw QuizError.BadRequest(`Quiz type wasn't provided`);
			if (!req.body) throw QuizError.BadRequest(`No any data was provided to create a quiz`);
			const { type } = req.params;
			req.body.userId = req.user!.id;

			const quiz = await QuizService.createQuiz(type, req.body);

			if (!quiz) return send(400, `Quiz wasn't created. Try later`);

			return send(200, 'Quiz created', { quiz })
		} catch (e) {
			next(e);
		}
	}

	static async getQuizzes(req: MyRequest<any>, res: MyResponse, next: any) { // quizzes of selected type
		const send = useSend(res);
		try {
			if (!req.params || !req.params.type) throw QuizError.BadRequest(`Quizzes' type wasn't provided`);
			const { type } = req.params;

			const quizzes = await QuizService.getQuizzes(type);

			return send(200, 'Quizzes received', { quizzes })
		} catch (e) {
			next(e);
		}
	}

	static async getProfileQuizzes(req: MyRequest<any>, res: MyResponse, next: any) { // user quizzes
		const send = useSend(res);
		try {
			if (!req.user) throw ApiError.UnauthorizedError();
			const { id } = req.user;
			const quizzes = await QuizService.findUserQuizzes(id.toString());

			send(201, `User's quizzes fetched`, { quizzes });
		} catch (e) {
			next(e);
		}
	}

	static async getQuiz(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.params) throw QuizError.BadRequest('Bad url');
			const { orderNumber, type } = req.params;

			if (!orderNumber) throw QuizError.BadRequest('No quiz order number');
			const quiz = await QuizService.findOne({ orderNumber: +orderNumber });

			send(201, `Quiz fetched successfully`, { quiz });
		} catch (e) {
			next(e);
		}
	}

	static async getQuizStatistics(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) throw QuizError.BadRequest('No data was passed');
			const { orderNumber } = req.params;

			if (!orderNumber) throw QuizError.BadRequest('No quiz id');
			const result = await QuizService.getStatistics(+orderNumber);

			send(201, `Statistics fetched successfully`, { ...result });
		} catch (e) {
			next(e);
		}
	}

	static async deleteQuiz(req: MyRequest<{ id: string }>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) throw QuizError.BadRequest('No data was provided to delete quiz!');
			const { id } = req.body;
			const isDeleted = await QuizService.deleteQuiz(id);

			send(201, 'Quiz has been deleted', { isDeleted, id })
		} catch (e) {
			next(e);
		}
	}

	static async saveUserAnswer(req: MyRequest<IAnswerFromFrontend & WithQuizTypeAndId>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) throw QuizError.BadRequest('No data was provided to delete quiz!');
			const answer = req.body;
			const quiz = await QuizService.saveUserAnswer(answer, req.user);

			return send(201, 'Your answer has been added to the quiz', { quiz })
		} catch (e) {
			next(e);
		}
	}
}