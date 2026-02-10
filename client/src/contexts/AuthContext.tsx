import { createContext, ReactNode, useEffect, useState } from "react";

import { CreateToastFnReturn, Spinner } from "@chakra-ui/react";

import { AxiosInstance } from "axios";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { NavigateFunction } from "react-router-dom";

import { auth } from "../utils/auth/firebase";
import { useBackendContext } from "./hooks/useBackendContext";

interface AuthContextProps {
  currentUser: User | null;
  signup: ({ email, password, role }: EmailPasswordRole) => Promise<UserCredential>;
  login: ({ email, password }: EmailPassword) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: ({ email }: Pick<EmailPassword, "email">) => Promise<void>;
  handleRedirectResult: (
    backend: AxiosInstance,
    navigate: NavigateFunction,
    toast: CreateToastFnReturn
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

interface EmailPassword {
  email: string;
  password: string;
}

interface EmailPasswordRole {
  email: string;
  password: string;
  role: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { backend } = useBackendContext();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async ({ email, password, role }: EmailPasswordRole) => {
    if (currentUser) {
      signOut(auth);
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await backend.post("/gcf-users/", {
      id: userCredential.user.uid,
      role: role,
      created_by: null,
      first_name: 'John',
      last_name: 'Doe'
    });

    return userCredential;
  };

  const login = ({ email, password }: EmailPassword) => {
    if (currentUser) {
      signOut(auth);
    }

    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = ({ email }: Pick<EmailPassword, "email">) => {
    return sendPasswordResetEmail(auth, email);
  };

  /**
   * Helper function which keeps our DB and our Firebase in sync.
   * If a user exists in Firebase, but does not exist in our DB, we create a new user.
   *
   * **If creating a DB user fails, we rollback by deleting the Firebase user.**
   */
  const handleRedirectResult = async (
    backend: AxiosInstance,
    navigate: NavigateFunction,
    toast: CreateToastFnReturn
  ) => {
    try {
      const result = await getRedirectResult(auth);

      if (result) {
        const response = await backend.get(`/gcf-users/${result.user.uid}`);
        if (response.data.length === 0) {
          try {
            await backend.post("/gcf-users/", {
              firebaseUid: result.user.uid,
              role: 'Admin',
              created_by: null,
              first_name: 'John',
              last_name: 'Doe',
            });
          } catch (e) {
            await backend.delete(`/gcf-users/${result.user.uid}`);
            toast({
              title: "An error occurred",
              description: `Account was not created: ${e.message}`,
              status: "error",
            });
          }
        }
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Redirect result error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signup,
        login,
        logout,
        resetPassword,
        handleRedirectResult,
      }}
    >
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
};
