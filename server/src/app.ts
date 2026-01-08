import { verifyToken } from "@/middleware";
import { usersRouter } from "@/routes/users";
import { directorRouter } from "@/routes/programDirector";
import { programUpdateRouter } from '@/routes/programUpdate';
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const CLIENT_HOSTNAME =
  process.env.NODE_ENV === "development"
    ? `${process.env.DEV_CLIENT_HOSTNAME}:${process.env.DEV_CLIENT_PORT}`
    : process.env.PROD_CLIENT_HOSTNAME;

export const app = express();
app.use(
  cors({
    origin: CLIENT_HOSTNAME,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV === "production") {
  app.use(verifyToken);
}

app.use("/users", usersRouter);
app.use("/program-directors", directorRouter)
app.use('/program-updates', programUpdateRouter);

// Listening is moved to server.ts to enable importing app in tests
export default app;
