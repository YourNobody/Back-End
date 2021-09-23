import { QuizesTypes } from "../interfaces/Quiz.interface";

export const ANONYMOUS_NAME = 'anonymous';
export const quizesNames = {
  [QuizesTypes.SA]: 'Select Quizes',
  [QuizesTypes.TA]: 'Text Quizes',
  [QuizesTypes.RA]: 'Rating Quizes',
  [QuizesTypes.AB]: 'A/B Quizes'
}