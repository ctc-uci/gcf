import { createContext, ReactNode, useState } from "react";

export type DevRole = "admin" | "regionalDirector" | "programDirector";

export const DEV_ROLE_USER_IDS: Record<DevRole, string> = {
  admin: "1",
  regionalDirector: "4",
  programDirector: "14",
};

interface DevRoleContextValue {
  devRole: DevRole | null;
  setDevRole: (role: DevRole) => void;
  devUserId: string | null;
}

export const DevRoleContext = createContext<DevRoleContextValue | null>(null);

export const DevRoleProvider = ({ children }: { children: ReactNode }) => {
  const [devRole, setDevRoleState] = useState<DevRole | null>(null);

  const setDevRole = (role: DevRole) => {
    setDevRoleState(role);
  };

  const devUserId = devRole ? DEV_ROLE_USER_IDS[devRole] : null;

  return (
    <DevRoleContext.Provider value={{ devRole, setDevRole, devUserId }}>
      {children}
    </DevRoleContext.Provider>
  );
};
