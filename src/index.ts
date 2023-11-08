import express from 'express';

const app: express.Application = express();
const port: number = 3000;

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World with TypeScript!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
