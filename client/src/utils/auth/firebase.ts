import { initializeApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  /**
   * `authDomain` should be set to your deployment domain or your local domain (e.g. `localhost:3000`). It should **NOT** be the default value provided by Firebase (e.g. `your-project.firebaseapp.com`)
   *
   * @see {@link https://firebase.google.com/docs/auth/web/redirect-best-practices#proxy-requests} for the officially documented reasons why.
   * @see {@link client/docs/signInWithRedirect.md} for more detailed documentation.
   */
  authDomain: import.meta.env.VITE_FRONTEND_HOSTNAME,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Synchronously retrieves the current user.
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

export const refreshToken = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const accessToken = await currentUser.getIdToken(true);

  return { accessToken };
};
