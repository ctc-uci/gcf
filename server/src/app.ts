import { verifyToken } from "@/middleware";
import { usersRouter } from "@/routes/users";
import { directorRouter } from "@/routes/programDirector";
import { programUpdateRouter } from '@/routes/programUpdate';
import { regionalDirectorRouter } from "@/routes/regionalDirector";
import { gcfUserRouter } from "@/routes/gcfUser";
// import { usersRouter } from "@/routes/users";
import { enrollmentChangeRouter } from "@/routes/enrollmentChange";
import { mediaChangeRouter } from "@/routes/mediaChange";
import { instrumentRouter } from "@/routes/instrument"
import { instrumentChangeRouter } from "@/routes/instrument-change"
import { countryRouter } from "@/routes/country";
import {regionRouter} from "@/routes/region";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { programRouter } from "@/routes/program";
import { partnerOrganizationRouter } from "@/routes/partnerOrganization";
import { imagesRouter } from "@/routes/images";

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

// app.use("/users", usersRouter);
app.use("/program-directors", directorRouter)
app.use('/program-updates', programUpdateRouter);
app.use("/instruments", instrumentRouter);
app.use("/instrument-changes", instrumentChangeRouter);
app.use("/gcf-users", gcfUserRouter);
app.use("/regional-directors", regionalDirectorRouter)
app.use("/country", countryRouter);
app.use("/region", regionRouter);
app.use("/enrollmentChange", enrollmentChangeRouter);
app.use("/mediaChange", mediaChangeRouter);
app.use("/program", programRouter);
app.use("/partners", partnerOrganizationRouter);
app.use("/images", imagesRouter);

// Listening is moved to server.ts to enable importing app in tests
export default app;
