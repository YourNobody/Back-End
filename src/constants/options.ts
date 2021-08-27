const uri = 'mongodb+srv://pavel:<password>@cluster0.whey9.mongodb.net/quiz-app';

const options = {
  PORT: 4000,
  MONGODB_URI: uri.replace(/<password>/, 'g8fw5IoLXGDAwKeA'),
  SESSION_SECRET: 'hht5kf3P8AGbcoY4PQaxmjMFPXeIhrf8tCBux3cJKa5HEq724HLgIbGygIx13jmY16SFtDkwUIgH4LjhTz4DudA4zFlZBKO9hIsiopHkv4LOcCQkphrELEvVY8BxbN9BK1L6kb0Fu9U8Oi5NqECQTdX1wDOUNC2MTS4xHDN1GcSrTfRjVvU1mzITcd0iMM27fsqtBW3JWk2ibh9KXZ6AzLDSVDI2YpqW0PSUYt8QtLsOhaD1Qm8YaRlyHqsqe36',
  
}

export { options };