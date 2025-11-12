import firebaseAdmin, { type ServiceAccount } from "firebase-admin";

// https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments
import serviceAccount from "./firebase-adminsdk.json";

export const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount as ServiceAccount),
});
