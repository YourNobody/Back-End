import express, { Application } from 'express';
import mongoose from 'mongoose';
import { homeRoutes } from './routes/home';
import { options } from './constants/options';

const app: Application = express();

app.use(express.json());

app.use('/', homeRoutes);

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