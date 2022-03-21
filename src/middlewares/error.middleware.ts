import {MyRequest, MyResponse} from "@Interfaces";
import {ApiError} from "@Exceptions";
import {useSend} from "@Helpers";

export function errorMiddleware(err: any, req: MyRequest<any>, res: MyResponse, next: any) {
	const send = useSend(res);
	if (err instanceof ApiError) {
		return send(err.status, err.message, { errors: err.errors });
	}

	send(500, err.message || 'Unexpected error');
}