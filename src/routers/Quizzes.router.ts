import {CommonRouter} from "@Routers/Common.router";
import {Application, Router} from "express";
import {QuizController} from "@Controllers";
import {authMiddleware} from "@Middlewares";

export class QuizzesRouter extends CommonRouter {
	constructor(app: Application) {
		super(app, 'AuthRoutes');
	}

	assignAllRouterTypes() {
		this.assignPostRoutes();
		this.assignGetRoutes();
	}

	assignPostRoutes() {
		this.router.post('/:type/:orderNumber/save', QuizController.saveUserAnswer); // save user answer on a quiz
		this.router.post('/:type/create', authMiddleware, QuizController.createQuiz); // create quiz
		this.router.post('/remove', authMiddleware, QuizController.deleteQuiz); // remove quiz
	}

	assignGetRoutes() {
		this.router.get('/:type', QuizController.getQuizzes); // get quizzes of particular type
		this.router.get('/stats/:orderNumber', QuizController.getQuizStatistics); // get quizzes of particular type
		this.router.get('/:type/:orderNumber/:title', QuizController.getQuiz); // get one quiz using its id ( queries => id )
	}

	configureRoutes(): Application {
		this.app.use('/quizzes', this.router);

		return this.app;
	}
}