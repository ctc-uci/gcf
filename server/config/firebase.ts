import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import firebaseAdmin, { type ServiceAccount } from 'firebase-admin';

let serviceAccount: ServiceAccount;
if (process.env.NODE_ENV === 'development') {
  // Read from disk at runtime (rather than a static `import`) so esbuild never
  // tries to resolve this gitignored, dev-only file while bundling the Lambda.
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const localPath = path.join(dirname, 'firebase-adminsdk.json');
  serviceAccount = JSON.parse(
    fs.readFileSync(localPath, 'utf-8')
  ) as ServiceAccount;
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
