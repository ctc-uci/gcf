import firebaseAdmin, { type ServiceAccount } from 'firebase-admin';

const rawJson = process.env.FIREBASE_ADMIN_SDK_JSON;
if (!rawJson) {
  throw new Error('FIREBASE_ADMIN_SDK_JSON env var is not set');
}

const serviceAccount = JSON.parse(rawJson) as ServiceAccount;

export const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});
