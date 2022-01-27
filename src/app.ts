import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.resolve(__dirname, '.env')});
import express, { Application } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import { authRoutes, profileRoutes, quizesRoutes } from './routes/routes';

try {
  const MONGO_URI = <string>process.env.MONGODB_URI;
  const SESSION_SECRET = <string>process.env.SESSION_SECRET;
  const app: Application = express();
  const MongoDBStoreSessioned = MongoDBStore(session);

  const store = new MongoDBStoreSessioned({
    uri: MONGO_URI,
    collection: 'sessions'
  })

  app.use(helmet());
  app.use(cors());
  app.use(hpp());
  app.use(express.json());

  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
  }));

  app.use('/auth', authRoutes);
  app.use('/profile', profileRoutes);
  app.use('/quizes', quizesRoutes);

  void async function() {
    try {
      await mongoose.connect(MONGO_URI, {
      })
      app.listen(process.env.PORT, () => {
        console.log('Server is running on port ' + process.env.PORT)
      })
    } catch (error) {
      console.error(error)
    }
  }();
} catch (error) {
  console.log(error);
}