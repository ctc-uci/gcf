import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import firebaseAdmin, { type ServiceAccount } from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments
// Use FIREBASE_SERVICE_ACCOUNT_JSON (full JSON string) from .env when set; otherwise use firebase-adminsdk.json
function getServiceAccount(): ServiceAccount {
  const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (fromEnv) {
    return JSON.parse(fromEnv) as ServiceAccount;
  }
  const jsonPath = path.resolve(__dirname, "firebase-adminsdk.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  return JSON.parse(raw) as ServiceAccount;
}

export const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(getServiceAccount()),
});
