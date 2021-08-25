const uri = 'mongodb+srv://pavel:<password>@cluster0.whey9.mongodb.net/quiz-app';

const options = {
  PORT: 4000,
  MONGODB_URI: uri.replace(/<password>/, 'g8fw5IoLXGDAwKeA')
}

export { options };