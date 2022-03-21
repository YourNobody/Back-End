import {IRegisterBody, IUser, IUserModel} from "@Interfaces";
import { Schema, model, Model } from "mongoose";
import {refs} from "@Models/refs";

const UserSchema = new Schema<IUser>({
  nickname: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  premium: { type: Boolean, default: false },
  quizzes: [
    {
      quizId: { type: Schema.Types.ObjectId, ref: refs.QUIZ, required: true }
    }
  ],
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String, required: true },
  avatar: { type: String },
  passwordChanged: { type: Date, required: true, default: new Date }
}, {
  versionKey: false,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
    }
  }
});

UserSchema.statics.build = (data: Omit<IRegisterBody, 'confirm'>) => {
  return new User({
    ...data,
    quizzes: [],
    subscriptions: []
  });
}

export const User = model<IUser, IUserModel>(refs.USER, UserSchema);

