import {Application, Router} from "express";

interface IRouter {
	getName: () => string;
	configureRoutes: () => Application;
	assignAllRouterTypes: () => void;
	assignPostRoutes?: () => void;
	assignGetRoutes?: () => void;
	assignPutRoutes?: () => void;
	assignDeleteRoutes?: () => void;
}


export abstract class CommonRouter implements IRouter {
	private _router: Router;
	protected set router(value: Router) {
		this._router = value;
	}
	protected get router(): Router {
		return this._router;
	}

	protected constructor(protected app: Application, protected name: string) {
		this.app = app;
		this.name = name;
		this._router = Router();

		this.assignAllRouterTypes();

		this.configureRoutes();
	}

	getName() {
		return this.name;
	}

	abstract configureRoutes(): Application;

	abstract assignAllRouterTypes(): void;
}
