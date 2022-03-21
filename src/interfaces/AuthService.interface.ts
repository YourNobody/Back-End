import {UserDto} from "@Dtos";

export interface IRegistrationAuthService {
	refreshToken: string;
	accessToken: string;
	user: UserDto;
}

export interface IRegistrationSuccess {
	isRegistered: boolean;
}