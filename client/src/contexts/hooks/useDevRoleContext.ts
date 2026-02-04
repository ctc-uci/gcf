import { useContext } from "react";
import { DevRoleContext } from "../DevRoleContext";

export const useDevRoleContext = () => {
  const context = useContext(DevRoleContext);
  if (!context) {
    throw new Error("useDevRoleContext must be used within DevRoleProvider");
  }
  return context;
};
