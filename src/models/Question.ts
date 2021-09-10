import { IQuestion, IAnswer } from "interfaces/Question.interface";
import { Schema, model, SchemaType } from "mongoose";
import { refs } from "./refs";

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  type: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  answers: [
    {
      answer: { type: String, required: true },
      userId: { type: Schema.Types.ObjectId, ref: refs.USER, required: false },
      amount: { type: Number, required: false }
    }
  ]
});

const Question = model<IQuestion>(refs.QUESTION, QuestionSchema);

export { Question };

