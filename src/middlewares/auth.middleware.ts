import {MyRequest, MyResponse} from "@Interfaces";
import {ApiError} from "@Exceptions";
import {TokenService} from "@Services";

export function authMiddleware(req: MyRequest<any>, res: MyResponse, next: any) {
	try {
		const authorizationHeader = req.headers.authorization?.trim();
		if (!authorizationHeader) return next(ApiError.UnauthorizedError());

		const accessToken = authorizationHeader.split(' ')[1].trim(); //[0] is the token type (Bearer)
		if (!accessToken) return next(ApiError.UnauthorizedError());

		const userData = TokenService.validateAccessToken(accessToken);
		if (!userData) return next(ApiError.UnauthorizedError());

		req.user = userData;
		next();
	} catch (e) {
		return next(ApiError.UnauthorizedError());
	}
}