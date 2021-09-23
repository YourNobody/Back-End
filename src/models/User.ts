import { IUser } from "interfaces/User.interface";
import { Schema, model, SchemaType } from "mongoose";
import { refs } from "./refs";

const UserSchema = new Schema<IUser>({
  nickname: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  quizes: [
    {
      quizId: {type: Schema.Types.ObjectId, required: true, unique: true}
    }
  ]
});

const User = model<IUser>(refs.USER, UserSchema);

export { User };

