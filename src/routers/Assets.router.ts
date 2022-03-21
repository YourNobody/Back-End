import {Application} from "express";
import {CommonRouter} from "@Routers/Common.router";
import {AssetsController} from "@Controllers";

export class AssetsRouter extends CommonRouter {
	constructor(app: Application) {
		super(app, 'AssetsRouter');
	}

	assignAllRouterTypes() {
		this.assignPostRoutes();
		this.assignGetRoutes();
	}

	assignPostRoutes() {
		this.router.post('/images/save', AssetsController.saveImage);
		this.router.post('/images/remove/:id', AssetsController.deleteImage);
	}

	assignGetRoutes() {
		this.router.get('/images', AssetsController.getImages);
		this.router.get('/images/:assetId', AssetsController.getOneImage);
	}

	configureRoutes(): Application {
		this.app.use('/assets', this.router);

		return this.app;
	}
}