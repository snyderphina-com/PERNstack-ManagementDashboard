import AgentAPI from "apminsight";
AgentAPI.config()

import express from 'express';
import cors from 'cors';
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";

import subjectsRouter from "./routes/subjects.js"
import usersRouter from "./routes/users.js"
import classesRouter from "./routes/classes.js"
import departmentsRouter from "./routes/departments.js"
import securityMiddleware from './middleware/security.js';

const app = express();
const PORT = Number(process.env.PORT) || 8000;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json());

app.use(securityMiddleware);

app.all("/api/auth/*splat", toNodeHandler(auth) as any);

app.use('/api/subjects', subjectsRouter);
app.use('/api/users', usersRouter);
app.use('/api/classes', classesRouter);
app.use('/api/departments', departmentsRouter)

app.get('/', (req, res) => {
  res.send('Hello Welcome to the Classroom Api');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
