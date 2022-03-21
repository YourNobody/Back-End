import {IRegisterBody, IUser, IRegistrationAuthService} from "@Interfaces";
import {UserModelService, Password, TokenService, EmailService} from "@Services";
import {UserDto} from "@Dtos";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { User } from "@Models";
import {ApiError} from "@Exceptions";

export class AuthService {
	private static async getNewTokensForUserAndSaveThem(user: IUser) {
		const userDtoJwt = UserDto.getUserDtoForJWT(user);
		const tokens = TokenService.generateTokens({ ...userDtoJwt });

		await TokenService.saveToken(userDtoJwt.id, tokens.refreshToken);

		return { tokens, userDto: UserDto.getUserDto(user) };
	}

	static async registration({ email, nickname, password, confirm }: IRegisterBody): Promise<IRegistrationAuthService> {
		if (password !== confirm) throw ApiError.BadRequest('Confirmation failed');

		const candidateByEmail = await UserModelService.findUserByEmail(email);
		const candidateByNickname = await UserModelService.findUserByNickname(nickname);

		if (candidateByNickname) throw ApiError.BadRequest('This nickname is in use');
		if (candidateByEmail) throw ApiError.BadRequest('This email is in use');

		const hashed = await Password.hash(password);
		const activationLink = uuidv4();

		const user = await UserModelService.createUser({
			nickname, email, activationLink,
			password: hashed
		});

		await EmailService.sendActivationEmail(email, activationLink);
		const { tokens, userDto } = await AuthService.getNewTokensForUserAndSaveThem(user);

		return { ...tokens, user: userDto };
	}

	static async login({ email, password }: Omit<IRegisterBody, 'confirm' | 'nickname'>) {
		const candidate = await UserModelService.findUserByEmail(email);

		if (!candidate) throw ApiError.BadRequest(`User with such email wasn't found`);

		if (!candidate.isActivated) {
			const activationLink = uuidv4();
			await EmailService.sendActivationEmail(email, activationLink);
			await UserModelService.findByIdAndUpdate(candidate._id.toString(), { activationLink, isActivated: false });
			throw ApiError.NonActivated();
		}

		const isPasswordsEquals = await bcrypt.compare(password, candidate.password);
		if (!isPasswordsEquals) throw ApiError.BadRequest('Wrong password');

		const { tokens, userDto } = await AuthService.getNewTokensForUserAndSaveThem(candidate);

		return { ...tokens, user: userDto };
	}

	static async logout(refreshToken: string) {
		const token = await TokenService.removeToken(refreshToken);
		return token;
	}

	static async refresh(refreshToken: string) {
		if (!refreshToken) throw ApiError.UnauthorizedError();

		const userData = TokenService.validateRefreshToken(refreshToken);
		const tokenFromDatabase = await TokenService.findToken(refreshToken);

		if (!userData || !tokenFromDatabase) throw ApiError.UnauthorizedError();

		const candidate = await User.findById(tokenFromDatabase.userId);
		if (!candidate) throw new Error('No user with such authorization token');

		const { tokens, userDto } = await AuthService.getNewTokensForUserAndSaveThem(candidate);

		return { ...tokens, user: userDto };
	}

	static async activate(activationLink: string) {
		const candidate = await UserModelService.findByActivationLink(activationLink);
		if (!candidate) throw new Error('Your activation link isn\'t valid');

		const newActivationLink = uuidv4();
		const user = await UserModelService.findByIdAndUpdate(candidate._id.toString(), {
			activationLink: newActivationLink,
			isActivated: true
		});

		if (!user) return false;

		return user.isActivated;
	}
}