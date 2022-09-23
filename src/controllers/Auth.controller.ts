import {IRegisterBody} from "../interfaces/User.interface";
import {MyRequest, MyResponse} from "../interfaces/express.interface";
import {useSend} from "../helpers/send.helper";
import {AuthService} from "../services/Auth.service";
import {ApiError} from "../exceptions/api.error";
import {validationResult} from 'express-validator';

export class AuthController {
	static async register(req: MyRequest<IRegisterBody>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) return;
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Validation error', errors as any));
			}
			const { nickname, password, confirm, email } = req.body;
			const userData = await AuthService.registration({ nickname, email, password, confirm });
			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 1 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});
			return send(201, 'User created', { isRegistered: userData && userData.refreshToken ? true : false })
		} catch (e: any) {
			next(e);
		}
	};

	static async login(req: MyRequest<Omit<IRegisterBody, 'confirm' | 'nickname'>>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.body) throw ApiError.BadRequest('No data for logging in was passed');
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Validation error', errors as any));
			}
			const { password, email } = req.body;
			const userData = await AuthService.login({ password, email });
			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 1 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});
			return send(201, 'User logged in', { ...userData })
		} catch (e: any) {
			next(e);
		}
	}

	static async activate(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.params.activationLink) throw ApiError.BadRequest('No activation token');
			const { activationLink } = req.params;
			const result = await AuthService.activate(activationLink);
			return send(200, 'Account has been activated', { isActivated: result, redirectTime: 5000 });
		} catch (e: any) {
			next(e);
		}
	}

	static async logout(req: MyRequest<null>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.cookies) throw new Error('Something went wrong');
			const { refreshToken } = req.cookies;
			if (!refreshToken) throw new Error('No refresh token');
			const token = await AuthService.logout(refreshToken);
			res.clearCookie('refreshToken');
			return send(200, 'Successfully logged out', { token });
		} catch (e: any) {
			next(e);
		}
	}

	static async refresh(req: MyRequest<any>, res: MyResponse, next: any) {
		const send = useSend(res);
		try {
			if (!req.cookies) throw ApiError.BadRequest('Something went wrong');
			const { refreshToken } = req.cookies;
			const tokenData = await AuthService.refresh(refreshToken);

			res.cookie('refreshToken', tokenData.refreshToken, {
				maxAge: 1 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});
			return send(201, 'Refreshed', { ...tokenData });
		} catch (e: any) {
			next(e);
		}
	}
}