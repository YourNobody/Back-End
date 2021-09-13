import { IQuestion } from "interfaces/Question.interface";
import { Schema, model, SchemaType } from "mongoose";
import { refs } from "./refs";

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: false },
  userId: { type: Schema.Types.ObjectId, required: true },
  questionAnswers: [
    {
      answer: { type: String, required: true }
    }
  ],
  usersAnswers: [
    {
      answer: { type: String, required: true },
      userId: { type: Schema.Types.ObjectId, ref: refs.USER, required: false }
    }
  ]
});

const Question = model<IQuestion>(refs.QUESTION, QuestionSchema);

export { Question };

