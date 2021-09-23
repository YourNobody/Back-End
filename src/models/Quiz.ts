import { IQuiz } from "interfaces/Quiz.interface";
import { Schema, model, SchemaType } from "mongoose";
import { refs } from "./refs";

const QuizSchema = new Schema<IQuiz>({
  question: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  quizAnswers: [
    {
      answer: { type: String, required: true },
    }
  ],
  usersAnswers: [
    {
      answer: { type: String, required: true },
      userId: { type: Schema.Types.ObjectId, ref: refs.USER, required: false },
      createdAt: { type: Date, required: true, default: Date.now}
    }
  ]
},{
  timestamps: true
});

const Quiz = model<IQuiz>(refs.QUESTION, QuizSchema);

export { Quiz };
