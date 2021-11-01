import { QuizesTypes } from "../interfaces/Quiz.interface";

export const ANONYMOUS_NAME = 'anonymous';
export const quizesNames = {
  [QuizesTypes.SA]: 'Select Quizes',
  [QuizesTypes.TA]: 'Text Quizes',
  [QuizesTypes.RA]: 'Rating Quizes',
  [QuizesTypes.AB]: 'A/B Quizes'
}

export const __v = '__v';
export const _id = '_id';

export const QUERY_RESET_TOKEN = 'reset_token';

export const SUBSCRIPTION = {
  price: 1999,
  currency: 'USD'
};

// export const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_API_ID,
//   measurementId: process.env.FIREBASE_MEASUREMENT_ID
// }