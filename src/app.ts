import express, { Application, Request, Response } from 'express';

const app: Application = express();

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: "Server is loaded!"
  })
});

app.listen(4000, () => {
  console.log('Server is loaded! Start working...')
})