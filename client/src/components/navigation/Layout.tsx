import { Box } from "@chakra-ui/react";

import { Outlet } from "react-router-dom";

import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "./layoutConstants";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Layout = () => {
  return (
    <>
      {/* TODO(login): Remove role prop; have Navbar/Sidebar read from useRoleContext (or AuthContext) instead. */}
      <Navbar />
      <Sidebar />
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
