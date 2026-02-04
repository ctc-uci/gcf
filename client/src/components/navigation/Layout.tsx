import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";
import { useDevRoleContext } from "@/contexts/hooks/useDevRoleContext";
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "./layoutConstants";

const devRoleToSnake = (devRole: string | null): string | undefined => {
  if (!devRole) return undefined;
  if (devRole === "admin") return "admin";
  if (devRole === "regionalDirector") return "regional_director";
  if (devRole === "programDirector") return "program_director";
  return undefined;
};

export const Layout = () => {
  const { role } = useRoleContext();
  const { devRole } = useDevRoleContext();
  const displayRole = devRoleToSnake(devRole) ?? role ?? "program_director";
  const sidebarRole = devRoleToSnake(devRole) ?? role ?? "admin";
  return (
    <>
      {/* TODO(login): Remove role prop; have Navbar/Sidebar read from useRoleContext (or AuthContext) instead. */}
      <Navbar role={displayRole} />
      <Sidebar role={sidebarRole} />
      <Box
        as="main"
        marginLeft={SIDEBAR_WIDTH}
        paddingTop={NAVBAR_HEIGHT}
        minHeight="100vh"
        paddingX={4}
      >
        <Outlet />
      </Box>
    </>
  );
};

