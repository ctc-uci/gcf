import firebaseAdmin, { type ServiceAccount } from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

function loadServiceAccount(): ServiceAccount {
  // Prefer credentials from env var when available
  if (process.env.FIREBASE_ADMIN_SDK) {
    return JSON.parse(process.env.FIREBASE_ADMIN_SDK) as ServiceAccount;
  }

  // Fallback to local JSON file for environments where it's present (e.g. local dev)
  const jsonPath = path.join(__dirname, 'firebase-adminsdk.json');

  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(raw) as ServiceAccount;
  }

  throw new Error(
    'Firebase admin credentials not configured. Set FIREBASE_ADMIN_SDK or add config/firebase-adminsdk.json.'
  );
}

const serviceAccount = loadServiceAccount();

export const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});
