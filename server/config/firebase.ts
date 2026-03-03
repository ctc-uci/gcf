import firebaseAdmin, { type ServiceAccount } from 'firebase-admin';
import dotenv from 'dotenv';

// JSON file fallback (used when env var is not provided)
// https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments
import fileServiceAccount from './firebase-adminsdk.json';

dotenv.config();

const serviceAccountFromEnv = process.env.FIREBASE_ADMIN_SDK
  ? (JSON.parse(process.env.FIREBASE_ADMIN_SDK) as ServiceAccount)
  : null;

const serviceAccount: ServiceAccount =
  serviceAccountFromEnv ?? (fileServiceAccount as ServiceAccount);

export const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});
