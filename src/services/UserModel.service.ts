import {IRegisterCreateUser, IUser, IUserCommon} from "@Interfaces";
import {User} from "@Models";

export class UserModelService {
	static async createUser(data: IRegisterCreateUser): Promise<IUser> {
		try {
			if (!data) throw new Error('Data for user creation wasn\'t passed');
			const user = User.build(data);
			await user.save();
			return user;
		} catch (e: any) {
			throw new Error(e.message);
		}
	}

	static async findUserByEmail(email: string): Promise<IUser | null> {
		try {
			const user = await User.findOne({ email }).exec();
			return user;
		} catch (e: any) {
			throw new Error(e.message);
		}
	}

	static async findUserByNickname(nickname: string): Promise<IUser | null> {
		try {
			const user = await User.findOne({ nickname }).exec();
			return user;
		} catch (e: any) {
			throw new Error(e.message);
		}
	}

	static async findByActivationLink(activationLink: string) {
		try {
			const user = await User.findOne({ activationLink }).exec();
			return user;
		} catch (e: any) {
			throw new Error(e.message);
		}
	}

	static async findById(id: string) {
		try {
			const user = await User.findOne({ id }).exec();
			return user;
		} catch (e: any) {
			throw new Error(e.message);
		}
	}

	static async findByIdAndUpdate(id: string, payload: Partial<Record<keyof IUser, IUser[keyof IUser]>>) {
		try {
			const user = await User.findByIdAndUpdate(id, payload, { new: true });
			return user;
		} catch (e: any) {
			throw new Error(e.message);
		}
	}
}