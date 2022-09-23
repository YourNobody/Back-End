import { Schema, model, Model, Document } from "mongoose";
import {refs} from "@Models/refs";
import {IToken} from "@Interfaces";

interface ITokenModel extends Model<IToken> {}

const TokenSchema = new Schema<IToken>({
	userId: { type: Schema.Types.ObjectId, ref: refs.USER },
	refreshToken: { type: String, required: true }
}, {
	versionKey: false,
});

export const Token = model<IToken & Document, ITokenModel>(refs.TOKEN, TokenSchema);

