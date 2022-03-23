import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.resolve(__dirname, '.env')});
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {CommonRouter, AuthRouter, ProfileRouter, QuizzesRouter} from "@Routers";
import {errorMiddleware} from "@Middlewares";
import {AssetsRouter} from "@Routers/Assets.router";
import { SubscriptionsRouter } from '@Routers/Subscriptions.router';

const routes: Array<CommonRouter> = [];

try {
  const MONGO_URI = <string>process.env.MONGODB_URI;
  const app: Application = express();

  app.use(helmet());
  app.use(cookieParser());
  app.use(cors({ credentials: true, origin: process.env.APP_BASE_URL }));
  app.use(hpp());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  routes.push(new AuthRouter(app));
  routes.push(new ProfileRouter(app));
  routes.push(new QuizzesRouter(app));
  routes.push(new AssetsRouter(app));
  routes.push(new SubscriptionsRouter(app));

  // app.use(errorMiddleware);

  void async function() {
    try {
      await mongoose.connect(MONGO_URI);
      app.listen(process.env.PORT, () => {
        console.log('Server is running on port ' + process.env.PORT)
      });
    } catch (error) {
      console.error(error);
    }
  }();
} catch (error) {
  console.log(error);
}