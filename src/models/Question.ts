// import { IQuestion, IAnswer } from "interfaces/Question.interface";
// import { Schema, model, SchemaType } from "mongoose";
// import { refs } from "./refs";

// const QuestionSchema = new Schema<IQuestion>({
//   question: { type: String, required: true },
//   type: { type: String, required: true },
//   date: { type: Date, required: true, default: Date.now },
//   userId: { type: Schema.Types.ObjectId, required: true },
//   answers: [
//     {
//       answer: { type: String, required: true },
//       date: { type: Date, required: true, default: Date.now },
//       userId: { type: Schema.Types.ObjectId, ref: refs.USER, required: false }
//     }
//   ]
// });

// const Question = model<IQuestion>(refs.USER, QuestionSchema);

// export { Question };

