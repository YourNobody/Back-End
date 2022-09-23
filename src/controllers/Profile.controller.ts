import {MyRequest, MyResponse} from "../interfaces/express.interface";
import {ProfileService} from "../services/Profile.service";
import {ApiError} from "../exceptions/api.error";
import {useSend} from "../helpers/send.helper";
import {AssetsService} from "@Services";

export class ProfileController {
	static async changeAvatar(req: MyRequest<{ imageBase64: string }>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body || !req.body.imageBase64) throw new Error('Something went wrong');
			const { id } = req.user!;

			const avatarUrl = await ProfileService.changeAvatar(req.body.imageBase64, id.toString());

			if (!avatarUrl) return send(400, 'Something went wrong');

			send(201, 'Profile avatar changed', { avatarUrl });
		} catch (e) {
			next(e);
		}
	}

	static async getSubscriptions(req: MyRequest<any>, res: MyResponse, next: any) {
		try {

		} catch (e: any) {
			next(e);
		}
	}

	static async changeEmail(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) throw new Error();
			if (!req.user) throw ApiError.UnauthorizedError();
			const { email, password } = req.body;
			const { id } = req.user;
			const user = await ProfileService.changeEmail(id.toString(), email, password);

			return send(201, `User's email has been updated`, {user});
		} catch (e) {
			next(e);
		}
	}

	static async changePassword(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) throw new Error();
			if (!req.user) throw ApiError.UnauthorizedError();
			const { password, confirm, oldPassword } = req.body;
			const { id } = req.user;
			const user = await ProfileService.changePassword(id.toString(), password, oldPassword);

			if (!user) throw ApiError.UnauthorizedError();

			return send(201, `User's password has been updated`, {user});
		} catch (e: any) {
			next(e);
		}
	}

	static async changeNickname(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) throw new Error();
			if (!req.user) throw ApiError.UnauthorizedError();
			const { nickname, password } = req.body;
			const { id } = req.user;
			const user = await ProfileService.changeNickname(id.toString(), nickname, password);

			if (!user) throw ApiError.UnauthorizedError();

			return send(201, `User's nickname has been updated`, {user});
		} catch (e: any) {
			next(e);
		}
	}

	static async getAccountInfo(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.user) throw ApiError.UnauthorizedError();
			const { id } = req.user;
			const user = await ProfileService.getAccountInfo(id.toString());

			return send(201, `User's info has been loaded`, {user});
		} catch (e: any) {
			next(e);
		}
	}
}