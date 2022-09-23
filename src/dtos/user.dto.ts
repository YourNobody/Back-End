import {IUser, IUserCommon} from "@Interfaces";

export class UserDto {
	static getUserDto(model: IUser) {
		const dto = {} as IUserCommon;

		dto.email = model.email;
		dto.passwordChanged = model.passwordChanged;
		dto.id = model._id.toString();
		dto.nickname = model.nickname;
		dto.quizzes = model.quizzes;
		dto.premium = model.premium;
		dto.avatar = model.avatar;

		return dto;
	}

	static getUserDtoForJWT(model: IUser) {
		const dto = {} as IUserCommon;

		dto.email = model.email;
		dto.id = model._id.toString();
		dto.nickname = model.nickname;
		dto.premium = model.premium;

		return dto;
	}
}