import express from 'express';
import cors from 'cors';

import subjectsRouter from "./routes/subjects.js"
import securityMiddleware from './middleware/security.js';

const app = express();
const PORT = 8000;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELET'],
  credentials: true
}))
app.use(express.json());

app.use(securityMiddleware);

app.use('/api/subjects', subjectsRouter)


app.get('/', (req, res) => {
  res.send('Hello Welcome to the Classroom Api');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
