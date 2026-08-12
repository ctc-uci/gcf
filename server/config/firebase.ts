import firebaseAdmin, { type ServiceAccount } from 'firebase-admin';

import localServiceAccount from './firebase-adminsdk.json';

let serviceAccount: ServiceAccount;
if (process.env.NODE_ENV === 'development') {
  serviceAccount = localServiceAccount as ServiceAccount;
} else {
  const rawJson = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!rawJson) {
    throw new Error('FIREBASE_ADMIN_SDK_JSON env var is not set');
  }
  serviceAccount = JSON.parse(rawJson) as ServiceAccount;
}

export const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});
