import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";

export const Layout = () => {
  const { role } = useRoleContext();
  return (
    <>
      {/* TODO: input real roles as props */}
      <Navbar role={role || "program_director"} />
      <Sidebar role={role || "admin"} />
      <main>
        <Outlet />
      </main>
    </>
  );
};

