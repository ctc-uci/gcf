import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "./layoutConstants";

export const Layout = () => {
  const { role } = useRoleContext();
  return (
    <>
      {/* TODO(login): Remove role prop; have Navbar/Sidebar read from useRoleContext (or AuthContext) instead. */}
      <Navbar role={role || "program_director"} />
      <Sidebar role={role || "admin"} />
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

