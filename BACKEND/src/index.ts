import AgentAPI from "apminsight";
AgentAPI.config();

import express from 'express';
import cors from 'cors';
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";

import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import securityMiddleware from './middleware/security.js';

const app = express();
const PORT = Number(process.env.PORT) || 8080;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth) as any);

app.use(securityMiddleware);

app.use('/api/subjects', subjectsRouter);
app.use('/api/users', usersRouter);
app.use('/api/classes', classesRouter);
app.use('/api/departments', departmentsRouter);

app.get('/', (req, res) => {
  res.send('Hello Welcome to the Classroom Api');
});

// ✅ Explicitly bind to '0.0.0.0' for Railway container proxying
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});