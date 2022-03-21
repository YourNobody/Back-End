import {MyRequest, MyResponse, IUser} from "@Interfaces";
import {UserModelService, Password, AssetsService} from "@Services";
import {ApiError} from "@Exceptions";
import {UserDto} from "@Dtos";

export class ProfileService {
	private static async checkAccessForChangingUserInfo(id: string, password: string) {
		const candidate = await UserModelService.findById(id);
		if (!candidate) throw ApiError.UnauthorizedError();
		if (!await Password.compare(password, candidate.password)) throw ApiError.PasswordsAreIncomparable();
	}

	static async reset() {
	}

	static async changeAvatar(imageBase64: string, userId: string) {
		const imageResource = await AssetsService.uploadOneImage(imageBase64);
		const updatedUser = await UserModelService.findByIdAndUpdate(userId, { avatar: imageResource.imageUrl });
		if (!updatedUser) return null;
		return updatedUser.avatar;
	}

	static async changeEmail(id: string, newEmail: string, password: string) {
		await ProfileService.checkAccessForChangingUserInfo(id, password);

		const userFromDatabase = await UserModelService.findByIdAndUpdate(id, { email: newEmail });
		if (!userFromDatabase) return null;
		return UserDto.getUserDto(userFromDatabase);
	}

	static async changePassword(id: string, newPassword: string, oldPassword: string) {
		await ProfileService.checkAccessForChangingUserInfo(id, oldPassword);

		const hashedNewPassword = await Password.hash(newPassword);
		const userFromDatabase = await UserModelService.findByIdAndUpdate(id, { password: hashedNewPassword });
		if (!userFromDatabase) return null;
		return UserDto.getUserDto(userFromDatabase);
	}

	static async changeNickname(id: string, newNickname: string, password: string) {
		await ProfileService.checkAccessForChangingUserInfo(id, password);

		const userFromDatabase = await UserModelService.findByIdAndUpdate(id, { nickname: newNickname });
		if (!userFromDatabase) return null;
		return UserDto.getUserDto(userFromDatabase);
	}

	static async getAccountInfo(id: string) {
		const userFromDatabase = await UserModelService.findById(id);
		if (!userFromDatabase) return null;
		return UserDto.getUserDto(userFromDatabase);
	}
}