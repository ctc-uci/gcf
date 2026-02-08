import { Button, Flex, Icon, Image, Link, Text } from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import { NAVBAR_HEIGHT } from "./layoutConstants";
import logo from "/logo.png";

interface NavbarProps {
  role: "admin" | "regional_director" | "program_director" | string;
}

function keysToCamel(data) {
  if (data === "Admin") {
    return "admin";
  } else if (data === "Regional Director") {
    return "regionalDirector";
  } else if (data === "Program Director") {
    return "programDirector";
  }
}

export const Navbar = () => {
  const { role } = useRoleContext();
  const camelRole = keysToCamel(role);
  const region = "North America"; // placeholder for region
  const project = "Royal Kids Family Camp"; // placeholder for project
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
          {camelRole === "admin" ? "Admin Dashboard" : ""}
          {camelRole === "regionalDirector"
            ? "Regional Director Dashboard"
            : ""}
          {camelRole === "programDirector" ? `${project}` : ""}

          {camelRole === "regionalDirector" ? `: ${region}` : ""}
        </Text>

        <Flex
          gap={2}
          align="center"
        >
          {/* TODO: Add profile page */}
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
        </Flex>
      </Flex>
    </Flex>
  );
};
