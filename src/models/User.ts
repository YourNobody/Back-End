import { IUser } from "interfaces/User.interface";
import { Schema, model, SchemaType } from "mongoose";
import { refs } from "./refs";

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      answers: [
        {
          answer: { type: String, required: true },
          date: { type: Date, required: true, default: Date.now },
          userId: { type: Schema.Types.ObjectId, ref: refs.USER, required: true }
        }
      ],
      date: { type: Date, required: true, default: Date.now }
    }
  ]
});

const User = model<IUser>(refs.USER, UserSchema);

export { User };

