import { useEffect, useState } from "react";

import { Button, Flex, Icon, Image, Link, Text } from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import { NAVBAR_HEIGHT } from "./layoutConstants";
import logo from "/logo.png";

export const Navbar = () => {
  const { role } = useRoleContext();
  const { logout } = useAuthContext();
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();
  const userId = currentUser?.uid;
  const [region, setRegion] = useState(""); // placeholder for region
  const [project, setProject] = useState(""); // placeholder for project
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };



  useEffect(() => {
    const fetchData = async (table: string, path: string) => {
      try {
        const response = await backend.get(`/${table}/${path}`);
        return response.data;
      } catch (error) {
        console.error(
          "Request failed:",
          path,
          error.response?.status,
          error.message
        );
        return [];
      }
    };

    const loadData = async () => {
      try {
        const [regionData, projectData] = await Promise.all([
          fetchData("region", `get-region-name/${userId}`),
          fetchData("program", `get-program-name/${userId}`),
        ]);

        setRegion(regionData.name);
        setProject(projectData.name);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    if (role === "Program Director" || role === "Regional Director")
      loadData();
  }, [role, userId, backend]);

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={10}
      height={NAVBAR_HEIGHT}
      align="center"
      w="100%"
      pl="1.4vw"
      borderBottom="1px solid #e2e8f0"
      bg="white"
    >
      <Image
        src={logo}
        alt="Logo"
        width={"9vw"}
        maxH="10vh"
        objectFit="contain"
      />

      <Flex
        justify="space-between"
        w="100%"
        px="2vw"
        align="center"
      >
        <Text fontSize="2vh">
          {role === "Super Admin" ? "Super Admin Dashboard" : ""}
          {role === "Admin" ? "Admin Dashboard" : ""}
          {role === "Regional Director" ? "Regional Director Dashboard" : ""}
          {role === "Program Director" ? `${project}` : ""}

          {role === "Regional Director" ? `: ${region}` : ""}
        </Text>

        <Flex
          gap={2}
          align="center"
        >
          <Button
            bg="white"
            as={Link}
            href="/profile"
            leftIcon={
              <Icon
                as={HiOutlineUser}
                boxSize="2vh"
              />
            }
            _hover={{ variant: "outline" }}
          >
            <Text fontSize="2vh">User</Text>
          </Button>
          {/* TODO: Remove logout button when auth flow is finalized */}
          <Button
            bg="white"
            leftIcon={
              <Icon
                as={HiOutlineLogout}
                boxSize="2vh"
              />
            }
            _hover={{ variant: "outline" }}
            onClick={handleLogout}
          >
            <Text fontSize="2vh">Logout</Text>
          </Button>
        </Flex >
      </Flex >
    </Flex >
  );
};
