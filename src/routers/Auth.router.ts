import {Application, Router} from "express";
import {CommonRouter} from "@Routers/Common.router";
import { AuthController } from "@Controllers";
import {Validation} from "@Middlewares";

export class AuthRouter extends CommonRouter {
	constructor(app: Application) {
		super(app, 'AuthRoutes');
	}

	assignAllRouterTypes() {
		this.assignPostRoutes();
		this.assignGetRoutes();
	}

	assignPostRoutes() {
		this.router.post('/login', Validation.validateOnLogin(), AuthController.login);
		this.router.post('/register', Validation.validateOnRegistration(), AuthController.register);
		this.router.post('/logout', AuthController.logout);
	}

	assignGetRoutes() {
		this.router.get('/activate/:activationLink', AuthController.activate);
		this.router.get('/refresh', AuthController.refresh);
	}

	configureRoutes(): Application {
		this.app.use('/auth', this.router);

		return this.app;
	}
}