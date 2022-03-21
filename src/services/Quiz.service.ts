import {AssetsService, QuizModelService, UserModelService} from "@Services";
import {
	IAnswerCommon,
	IQuiz,
	IQuizAB,
	IQuizRA,
	IQuizSA,
	IQuizTA,
	IVariant,
	QuizesTypes, WithQuizTypeAndId,
	IImage, IImageCommon, WithImageBase64, IImageRequestBody, IQuizCommon, IUserCommon, IAnswerFromFrontend
} from "@Interfaces";
import {ImageDto, QuizDto} from "@Dtos";
// import {User, Image} from "@Models";
import {CloudinaryApi} from "@ThirdParty/thirdPartyApi.api";
import {FilterQuery} from "mongoose";
import {User} from "@Models";

export class QuizService {
	private static onlyAnswersMean = [QuizesTypes.TA, QuizesTypes.RA];
	private static async saveImagesToDatabase(images: IImageRequestBody[]) {
		const newImagesInCloudinary = await CloudinaryApi.uploadArrayOfImages(images);

		return newImagesInCloudinary.map(img => ImageDto.prepareImageToDatabase(img));
	}

	static async getQuizzes(type: string) {
		const quizzesFromDatabase = await QuizModelService.getQuizzesAccordingToType(type);
		const quizzes = quizzesFromDatabase.map(quiz => {
			return QuizDto.createDto(type, quiz);
		});
		return quizzes;
	}

	static async createQuiz(type: string, payload: IQuiz & { images: WithImageBase64[] }) {
		let quizDto  = null;

		if (payload.quizAvatar) {
			const result = await AssetsService.uploadOneImage(payload.quizAvatar);
			payload.quizAvatar = result.imageUrl;
		}

		switch (type) {
			case QuizesTypes.SA: {
				quizDto = await QuizService.createQuizSA(payload);
				break;
			}
			case QuizesTypes.TA: {
				quizDto = await QuizService.createQuizTA(payload);
				break;
			}
			case QuizesTypes.RA: {
				let images: IImageCommon[] = [];
				if (payload.images) {
					images = await QuizService.saveImagesToDatabase(payload.images);
					if (!images || !images.length) return null;
				}

				payload.variants = images.map((img): IVariant => ({ image: img }));


				quizDto = await QuizService.createQuizRA(payload);
				break;
			}
			case QuizesTypes.AB: {
				const images = await QuizService.saveImagesToDatabase(payload.images);
				if (!images || !images.length) return null;

				payload.variants = images.map((img): IVariant => ({ image: img }));

				quizDto = await QuizService.createQuizAB(payload);
				break;
			}
		}

		if (!quizDto) return null;

		const user = await UserModelService.findById(payload.userId.toString());

		if (!user) return null;

		user.quizzes = [...user.quizzes, { quizId: quizDto.id }];
		await user.save();

		return quizDto;
	}

	static async deleteQuiz(id: string) {
		const result = await QuizModelService.deleteById(id);
		return result;
	}

	static async saveUserAnswer(answer: IAnswerFromFrontend & WithQuizTypeAndId, userInfo: IUserCommon | undefined) {
		let userId = null;
		if (userInfo) {
			const user = await UserModelService.findUserByEmail(userInfo?.email);
			userId = user?.id;
		}
		const answerDto = QuizDto.getAnswerDtoAccordingToQuizType(answer.quizType, answer, userId);
		const quiz = await QuizModelService.addUserAnswer(answer.quizId, answerDto);
		if (!quiz) throw new Error('Something went wrong');
		return quiz;
	}

	static async findUserQuizzes(userId: string) {
		const populatedUser: any = await User.findById(userId).populate({ path: 'quizzes', populate: 'quizId' });
		if (!populatedUser) throw new Error('No such user');
		const quizzes = populatedUser.quizzes.reduce((acc: any[], quizObj: { quizId: any }) => {
			if (quizObj.quizId) acc.push(QuizDto.createDto(quizObj.quizId.type, quizObj.quizId));
			return acc;
		}, []);

		return quizzes;
	}

	static async findById(id: string) {
		const quiz = await QuizModelService.findById(id);
		if (!quiz) return null;
		const quizDto = QuizDto.createDto(quiz.type, quiz);
		return quizDto;
	}

	static async findOne(queryParams: FilterQuery<IQuiz>) {
		const quiz = await QuizModelService.findOne(queryParams);
		if (!quiz) return null;
		const quizDto = QuizDto.createDto(quiz.type, quiz);
		return quizDto;
	}

	static async getStatistics(orderNumber: number) {
		if (!orderNumber) return;
		const quiz = await QuizModelService.findOne({ orderNumber });
		if (!quiz) return null;

		const quizDto = QuizDto.createDto(quiz.type, quiz);
		const quizDtoStats = QuizDto.getQuizStats(quiz.type, quiz);

		return {
			quiz: quizDto,
			stats: quizDtoStats
		};
	}

	private static async createQuizSA(payload: IQuiz): Promise<IQuizSA> {
		const type = QuizesTypes.SA;

		if (payload.variants && payload.variants.length) {
			//@ts-ignore
			payload.variants = payload.variants.map(variant => ({ answer: variant }));
		}

		const keys: (keyof IQuizSA)[] = ['title', 'question', 'variants', 'answers', 'type', 'userId', 'quizAvatar', 'multiple'];
		const quiz = await QuizModelService.createQuiz<IQuizSA>(type, keys, payload);

		const quizDto = QuizDto.createDto<IQuizSA>(type, quiz);
		return quizDto;
	}

	private static async createQuizTA(payload: IQuiz): Promise<IQuizTA> {
		const type = QuizesTypes.TA;
		const keys: (keyof IQuizTA)[] = ['title', 'question', 'answers', 'type', 'userId', 'quizAvatar'];
		const quiz = await QuizModelService.createQuiz<IQuizTA>(type, keys, payload);

		const quizDto = QuizDto.createDto<IQuizTA>(type, quiz);
		return quizDto;
	}

	private static async createQuizRA(payload: IQuiz): Promise<IQuizRA> {
		const type = QuizesTypes.RA;
		const keys: (keyof IQuizRA)[] = ['title', 'question', 'answers', 'type', 'userId', 'variants', 'quizAvatar'];
		const quiz = await QuizModelService.createQuiz<IQuizRA>(type, keys, payload);

		const quizDto = QuizDto.createDto<IQuizRA>(type, quiz);
		return quizDto;
	}

	private static async createQuizAB(payload: IQuiz): Promise<IQuizAB> {
		const type = QuizesTypes.AB;
		const keys: (keyof IQuizAB)[] = ['title', 'question', 'variants', 'answers', 'userId', 'type', 'quizAvatar'];
		const quiz = await QuizModelService.createQuiz<IQuizAB>(type, keys, payload);

		const quizDto = QuizDto.createDto<IQuizAB>(type, quiz);
		return quizDto;
	}

	private static async saveUserAnswerToQuizSA(answer: IAnswerCommon) {
		const keys: (keyof Omit<IAnswerCommon, 'message' | 'rating'>)[] = ['variantId', 'userId'];
	}

	private static async saveUserAnswerToQuizTA(answer: IAnswerCommon) {
		const keys: (keyof Omit<IAnswerCommon, 'variantId' | 'rating'>)[] = ['message', 'userId'];
	}

	private static async saveUserAnswerToQuizRA(answer: IAnswerCommon) {
		const keys: (keyof Omit<IAnswerCommon, 'message' | 'variantId'>)[] = ['rating', 'userId'];
	}

	private static async saveUserAnswerToQuizAB(answer: IAnswerCommon) {
		const keys: (keyof Omit<IAnswerCommon, 'message' | 'rating'>)[] = ['variantId', 'userId'];
	}
}