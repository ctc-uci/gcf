import { verifyToken } from '@/middleware';
import { accountChangeRouter } from '@/routes/accountChange';
import { adminRouter } from '@/routes/admin';
import { countryRouter } from '@/routes/country';
import { enrollmentChangeRouter } from '@/routes/enrollmentChange';
import { gcfUserRouter } from '@/routes/gcfUser';
import { imagesRouter } from '@/routes/images';
import { instrumentRouter } from '@/routes/instrument';
import { instrumentChangeRouter } from '@/routes/instrument-change';
import { instrumentChangePhotoRouter } from '@/routes/instrumentChangePhoto';
import { mediaChangeRouter } from '@/routes/mediaChange';
import { partnerOrganizationRouter } from '@/routes/partnerOrganization';
import { playlistCacheRouter } from '@/routes/playlistCache';
import { programRouter } from '@/routes/program';
import { directorRouter } from '@/routes/programDirector';
import { programUpdateRouter } from '@/routes/programUpdate';
import { rdProgramTableRouter } from '@/routes/rdProgramTable';
import { regionRouter } from '@/routes/region';
import { regionalDirectorRouter } from '@/routes/regionalDirector';
import { updatesPermissionsRouter } from '@/routes/updatesPermissions';
import { fileChangeRouter } from '@/routes/fileChange';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const CLIENT_HOSTNAME =
  process.env.NODE_ENV === 'development'
    ? `${process.env.DEV_CLIENT_HOSTNAME}:${process.env.DEV_CLIENT_PORT}`
    : process.env.PROD_CLIENT_HOSTNAME;

export const app = express();
app.use(
  cors({
    origin: CLIENT_HOSTNAME,
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);

app.use(express.json());
app.use(verifyToken);

// app.use("/users", usersRouter);
app.use('/admin', verifyToken, adminRouter);
app.use('/rdProgramTable', verifyToken, rdProgramTableRouter);
app.use('/program-directors', verifyToken, directorRouter);
app.use('/program-updates', verifyToken, programUpdateRouter);
app.use('/instruments', verifyToken, instrumentRouter);
app.use('/instrument-changes', verifyToken, instrumentChangeRouter);
app.use('/instrument-change-photos', verifyToken, instrumentChangePhotoRouter);
app.use('/gcf-users', verifyToken, gcfUserRouter);
app.use('/update-permissions', verifyToken, updatesPermissionsRouter);
app.use('/regional-directors', verifyToken, regionalDirectorRouter);
app.use('/country', countryRouter);
app.use('/region', regionRouter);
app.use('/enrollmentChange', verifyToken, enrollmentChangeRouter);
app.use('/mediaChange', verifyToken, mediaChangeRouter);
app.use('/program', programRouter);
app.use('/partners', verifyToken, partnerOrganizationRouter);
app.use('/images', verifyToken, imagesRouter);
app.use('/playlistCache', verifyToken, playlistCacheRouter);
app.use('/fileChanges', fileChangeRouter);
app.use('/accountChange', accountChangeRouter);

// Listening is moved to server.ts to enable importing app in tests
export default app;
