import express from 'express';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello Welcome to the Classroom Api');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
