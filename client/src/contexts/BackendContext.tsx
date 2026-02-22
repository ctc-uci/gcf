import { createContext, ReactNode } from "react";

import axios, { AxiosInstance } from "axios";

import { authInterceptor } from "../utils/auth/authInterceptor";

const baseURL = import.meta.env.VITE_BACKEND_HOSTNAME;

interface BackendContextProps {
  backend: AxiosInstance;
}

export const BackendContext = createContext<BackendContextProps | null>(null);

export const BackendProvider = ({ children }: { children: ReactNode }) => {
  const backend = axios.create({
    baseURL,
    withCredentials: true,
  });

  authInterceptor(backend);

  return (
    <BackendContext.Provider value={{ backend }}>
      {children}
    </BackendContext.Provider>
  );
};
