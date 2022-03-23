import {CommonRouter} from "@Routers/Common.router";
import {Application, Router} from "express";
import {Validation, authMiddleware} from "@Middlewares";
import {ProfileController, QuizController} from "@Controllers";

export class ProfileRouter extends CommonRouter {
	constructor(app: Application) {
		super(app, 'ProfileRoutes');
	}

	assignAllRouterTypes() {
		this.assignPostRoutes();
		this.assignGetRoutes();
	}

	assignPostRoutes() {
		this.router.post('/change/email', ProfileController.changeEmail);
		this.router.post('/change/password', ProfileController.changePassword);
		this.router.post('/change/nickname', ProfileController.changeNickname);
		this.router.post('/change/avatar', ProfileController.changeAvatar);
	}

	assignGetRoutes() {
		this.router.get('/quizzes', QuizController.getProfileQuizzes);
		this.router.get('/account', ProfileController.getAccountInfo);
		this.router.get('/statistics', QuizController.getQuizStatistics);
	}

	configureRoutes(): Application {
		this.app.use('/profile', authMiddleware, this.router);

		return this.app;
	}
}