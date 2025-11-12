import axios from "axios";
import { initializeApp } from "firebase/app";
import { getAuth, User } from "firebase/auth";

import { cookieKeys, setCookie } from "./cookie";

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

const REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${
  import.meta.env.VITE_FIREBASE_APIKEY
}`;

export const refreshToken = async () => {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    const refreshToken = currentUser.refreshToken;
    const response = await axios.post(REFRESH_URL, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const id_token = response.data.id_token;

    // Sets the appropriate cookies after refreshing access token
    setCookie({
      key: cookieKeys.ACCESS_TOKEN,
      value: id_token,
    });

    return { accessToken: id_token };
  }
  return null;
};
