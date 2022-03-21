import {Document, model, Schema} from "mongoose";
import {refs} from "@Models/refs";
import {IQuiz, IQuizModel} from "@Interfaces";

const QuizSchema = new Schema<IQuiz>({
	type: { type: String, required: true },
	question: { type: String, required: true },
	orderNumber: { type: Number, required: true, unique: true },
	premium: { type: Boolean, required: true, default: false },
	title: { type: String, required: true, unique: true },
	multiple: { type: Boolean },
	userId: { type: Schema.Types.ObjectId, ref: refs.USER, required: true },
	quizAvatar: { type: String },
	variants: [
		{
			image: {
				imageUrl: { type: String },
				bytes: { type: Number },
				format: { type: String },
				publicId: { type: String },
				assetId: { type: String },
				etag: { type: String },
			},
			answer: { type: String, index: true, sparse: true}
		}
	],
	answers: [
		{
			answer: { type: String },
			message: { type: String },
			rating: {
				rate: { type: Number },
				scale: { type: Number }
			},
			userId: { type: Schema.Types.ObjectId, ref: refs.USER },
			variantId: { type: Schema.Types.ObjectId },
			variantIds: [{
				type: String
			}],
			createdAt: { type: Date, required: true },
			updatedAt: { type: Date },
			_id: { type: String, required: true }
		}
	]
}, { versionKey: false, timestamps: true });

QuizSchema.statics.build = <T>(payload: Exclude<IQuiz, keyof Document>): T => {
	return new Quiz({
		...payload,
		answers: []
	}) as T & IQuiz;
}

export const Quiz = model<IQuiz, IQuizModel>(refs.QUIZ, QuizSchema);