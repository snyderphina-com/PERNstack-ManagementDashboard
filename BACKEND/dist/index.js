import AgentAPI from "apminsight";
AgentAPI.config();
import express from "express";
import cors from "cors";
import { auth } from "./db/lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import enrollmentsRouter from "./routes/enrollments.js";
import uploadRouter from "./routes/upload.js";
import notificationsRouter from "./routes/notifications.js";
import adminInvitationsRouter from "./routes/adminInvitations.js";
import securityMiddleware from "./middleware/security.js";
const app = express();
const PORT = Number(process.env.PORT) || 8080;
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env file");
}
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express.json({ limit: "10mb" })); // ← limit raised for base64 images
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(securityMiddleware);
app.use("/api/subjects", subjectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admin/invitations", adminInvitationsRouter);
app.get("/", (_req, res) => {
    res.send("Hello Welcome to the Classroom Api");
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map