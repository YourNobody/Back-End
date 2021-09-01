import express, { Application } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';
import { authRoutes, homeRoutes, profileRoutes } from './routes/routes';
import { options } from './constants/options';

const app: Application = express();
const MongoDBStoreSessioned = MongoDBStore(session);

const store = new MongoDBStoreSessioned({
  uri: options.MONGODB_URI,
  collection: 'sessions'
})

app.use(express.json());

app.use(session({
  secret: options.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}));

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

void async function() {
  try {
    await mongoose.connect(options.MONGODB_URI, {
    })
    app.listen(options.PORT, () => {
      console.log('Server is running on port ' + options.PORT)
    })
  } catch (error) {
    console.error(error)
  }
}()