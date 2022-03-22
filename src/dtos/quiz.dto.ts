import {
	IAnswer,
	IAnswerCommon, IAnswerFromFrontend,
	IQuiz,
	IQuizRequired, IUserCommon, IVariant,
	QuizesTypes,
	WithQuizTypeAndId
} from "@Interfaces";
import {Schema} from "mongoose";

export class QuizDto {
	static createDto<T extends IQuizRequired & Partial<IQuiz>>(type: string, quiz: Partial<IQuiz>): T & IQuizRequired {
		const { title, userId, question, premium, _id, createdAt, quizAvatar, orderNumber, answers } = quiz as IQuizRequired & Partial<IQuiz>;
		const dto: Partial<IQuiz> = { type, userId, question, title, premium, id: _id, createdAt, quizAvatar, orderNumber, answers };
		switch (type) {
			case QuizesTypes.SA: {
				const { variants, multiple } = quiz;
				Object.assign(dto, { variants, multiple });
				break;
			}
			case QuizesTypes.TA: {
				Object.assign(dto, {});
				break;
			}
			case QuizesTypes.RA: {
				const { images, variants } = quiz;
				Object.assign(dto, { images, variants });
				break;
			}
			case QuizesTypes.AB: {
				const { variants, images } = quiz;
				Object.assign(dto, { variants, images });
				break;
			}
		}

		dto.variants = dto.variants?.map(variant => {
			const v = JSON.parse(JSON.stringify(variant)) as IVariant;
			if (v._id) {
				v.id = v._id.toString();
				delete v._id;
			}
			return v;
		});

		dto.answers = dto.answers?.map(answer => {
			const v = JSON.parse(JSON.stringify(answer)) as IAnswer;
			if (v._id) {
				v.id = v._id.toString();
				delete v._id;
			}
			return v;
		})

		dto.userId = dto.userId!.toString();
		dto.id = dto.id!.toString();

		return dto as T;
	}

	static getAnswerDtoAccordingToQuizType(
		type: string,
		payload: IAnswerFromFrontend & WithQuizTypeAndId,
		userId: string | null
	): IAnswerCommon {

		let dto = { userId };

		switch (type) {
			case QuizesTypes.SA: {
				const { answers, multiple } = payload as Omit<IAnswerFromFrontend, 'message' | 'rating'>;
				Object.assign(dto, { answers, multiple });
				break;
			}
			case QuizesTypes.TA: {
				const { message } = payload as Omit<IAnswerFromFrontend, 'answers' | 'rating' | 'multiple'>;
				Object.assign(dto, { message });
				break;
			}
			case QuizesTypes.RA: {
				const { rating } = payload as Omit<IAnswerFromFrontend, 'message' | 'answers' | 'multiple'>;
				Object.assign(dto, { rating });
				break;
			}
			case QuizesTypes.AB: {
				const { variantId } = payload as Omit<IAnswerFromFrontend, 'message' | 'answers' | 'multiple' | 'rating'>;
				Object.assign(dto, { variantId });
				break;
			}
		}

		return dto as IAnswerCommon;
	}

	static getQuizStats(quizType: string, quiz: IQuiz) {
		let stats: any = null;

		switch (quizType) {
			case QuizesTypes.SA: {
				const { multiple, variants, answers } = quiz;

				if (multiple) {
					stats = answers.reduce((acc: any, answer, index) => {
						const variantsOfAnswer = answer.variantIds!.map((varId: string | Schema.Types.ObjectId) => {
							return variants!.find(variant => variant._id!.toString() === varId.toString())
						});

						variantsOfAnswer.forEach(variant => {
							if (variant && variant.answer) {
								if (acc[variant.answer]) {
									acc[variant.answer].count++;
								} else {
									acc[variant.answer] = { count: 1 };
								}
							}
						});

						return acc;
					}, {});
				} else {
					stats = answers.reduce((acc: any, answer, index) => {
						const variantOfAnswer = variants!.find(variant => variant._id!.toString() === answer.variantId!.toString());
						if (variantOfAnswer) {
							if (acc[variantOfAnswer.answer!]) {
								acc[variantOfAnswer.answer!].count++;
							} else {
								acc[variantOfAnswer.answer!] = { count: 1 };
							}
						}
						return acc;
					}, {});
				}

				stats = Object.keys(stats).map(key => {
					return {
						//@ts-ignore
						...stats[key],
						answer: key
					};
				});

				break;
			}
			case QuizesTypes.TA: {
				const { answers } = quiz;

				stats = answers.reduce((acc: any, answer, index) => {
					acc.push({
						message: answer?.message,
						createdAt: answer?.createdAt
					});
					return acc;
				}, []);

				break;
			}
			case QuizesTypes.RA: {
				const { answers } = quiz;

				stats = answers.reduce((acc: any, answer, index) => {
					acc.push({
						rating: answer?.rating,
						createdAt: answer?.createdAt
					});
					return acc;
				}, []);

				break;
			}
			case QuizesTypes.AB: {
				const { variants, answers } = quiz;

				stats = answers.reduce((acc: any, answer, index) => {
					const variantOfAnswerIndex = variants!.findIndex(variant => variant._id!.toString() === answer.variantId!.toString());
					const naming = variantOfAnswerIndex ? 'right' : 'left';

					if (acc[naming]) {
						acc[naming].count++;
					} else {
						acc[naming] = { count: 1 };
					}

					return acc;
				}, {});

				stats = Object.keys(stats).map(key => {
					return {
						//@ts-ignore
						...stats[key],
						answer: key
					};
				});

				break;
			}
		}

		return stats;
	}
}