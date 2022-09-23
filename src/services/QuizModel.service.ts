import {Quiz} from "@Models";
import {
	IAnswerCommon,
	IAnswerFromFrontend,
	IQuiz,
	IQuizCommon,
	IQuizSA,
	QuizesTypes,
	WithQuizTypeAndId
} from "@Interfaces";
import {Document, FilterQuery} from "mongoose";
import {v4 as uuidv4} from 'uuid';

export class QuizModelService {
	private static premiumTypes = [QuizesTypes.AB];

	static async findById(id: string): Promise<IQuiz | null> {
		const quiz = await Quiz.findById(id);
		return quiz;
	}

	static async addUserAnswer(quizId: string, answer: IAnswerCommon) {
		if (!answer) return;
		const quiz = await QuizModelService.findById(quizId);
		if (!quiz || !quiz.answers) return null;

		if (quiz.type === 'sa') {
			let newAnswer = {
				_id: uuidv4(),
				createdAt: new Date(),
				updatedAt: null
			} as IAnswerCommon;

			if (quiz.multiple) {
				newAnswer = {
					...newAnswer,
					variantIds: answer.answers!.map(answerVariant => answerVariant.variantId),
					userId: answer.userId,
				};
			} else {
				newAnswer = {
					...newAnswer,
					variantId: answer.answers![0].variantId,
					userId: answer.userId
				};
			}

			quiz.answers = [...quiz.answers, newAnswer];
			await quiz.save();
			return quiz;
		}

		quiz.answers = [...quiz.answers, { ...answer, createdAt: new Date(), _id: uuidv4() }];
		await quiz.save();
		return quiz;
	}

	static async getQuizzesAccordingToType(type: string): Promise<IQuiz[]> {
		return Quiz.find({ type }).exec();
	}

	static async deleteById(id: string): Promise<boolean> {
		const { deletedCount } = await Quiz.deleteOne({ _id: id });
		return deletedCount === 1;
	}

	static async createQuiz<T>(type: string, keys: (keyof T)[], payload: Exclude<IQuiz, keyof Document>): Promise<T> {
		const quizzes = await Quiz.find();

		const data = { type,
			premium: false,
			orderNumber: quizzes.length + 1,
		} as Record<keyof (T & IQuiz), unknown>;

		data.quizAvatar = payload.quizAvatar || null;
		QuizModelService.premiumTypes.includes(data.type as string) && (data.premium = true);

		for (const key of keys) {
			// @ts-ignore
			if (key in payload && payload[key]) { // @ts-ignore
				data[key] = payload[key];
			}
		}

		const quiz = Quiz.build<T>(data as IQuiz);
		await quiz.save();
		return quiz;
	}

	static async findOne(queryParams: FilterQuery<IQuiz>) {
		return (await Quiz.findOne(queryParams));
	}
}