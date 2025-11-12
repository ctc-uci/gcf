import { useContext } from "react";

import { BackendContext } from "../BackendContext";

export const useBackendContext = () => {
  const context = useContext(BackendContext);

  if (!context) {
    throw new Error("useBackendContext must be used within an BackendProvider");
  }

  return context;
};
