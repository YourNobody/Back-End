import jwt, {JwtPayload} from "jsonwebtoken";
import {Schema} from "mongoose";
import {Token} from "@Models";
import {IToken, IUserCommon} from "@Interfaces";
import {UserDto} from "@Dtos";

export class TokenService {
	static generateTokens(payload: string | object | Buffer) {
		const accessToken = jwt.sign(payload, <string>process.env.JWT_ACCESS_SECRET, {
			expiresIn: '1m'
		});
		const refreshToken = jwt.sign(payload, <string>process.env.JWT_REFRESH_SECRET, {
			expiresIn: '15m'
		});

		return { accessToken, refreshToken };
	}

	static async saveToken(userId: string, refreshToken: string) {
		const tokenData = await Token.findOne({ userId: <any>userId });
		if (tokenData) {
			tokenData.refreshToken = refreshToken;
			await tokenData.save();
			return tokenData;
		}
		const token = new Token({ userId, refreshToken });

		await token.save();

		return token;
	}

	static async removeToken(refreshToken: string) {
		const tokenData = await Token.deleteOne({ refreshToken });
		return tokenData;
	}

	static validateAccessToken(accessToken: string) {
		try {
			const userData = jwt.verify(accessToken, <string>process.env.JWT_ACCESS_SECRET) as IUserCommon & JwtPayload;
			return userData;
		} catch (e) {
			return null;
		}
	}

	static validateRefreshToken(refreshToken: string): UserDto & JwtPayload | null {
		try {
			const userData = jwt.verify(refreshToken, <string>process.env.JWT_REFRESH_SECRET) as UserDto & JwtPayload;
			return userData;
		} catch (e) {
			return null;
		}
	}

	static async findToken(refreshToken: string) {
		const token = await Token.findOne({ refreshToken });
		return token;
	}
}