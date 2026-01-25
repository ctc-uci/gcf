import { useEffect, useState } from "react";

import { Box, Center, Flex, Heading, Spinner, Text } from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";

import { AccountsTable, GcfUserTableData } from "./AccountsTable";
import { AccountToolbar } from "./AccountToolbar";

export const Account = () => {
  const [users, setUsers] = useState<GcfUserTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { backend } = useBackendContext();
  // const { role, loading: roleLoading } = useRoleContext();

  // FOR TESTING PURPOSES ONLY - REMOVE ONCE ROLES ARE IMPLEMENTED
  const role = "Admin";
  const roleLoading = false;

  useEffect(() => {
    const fetchUsers = async () => {
      if (roleLoading) return;

      if (!role) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let fetchedData: GcfUserTableData[] = [];

        if (role === "Admin") {
          const [pdResponse, rdResponse] = await Promise.all([
            backend.get("/program-directors/summary"),
            backend.get("/regional-directors/summary"),
          ]);

          const pds = pdResponse.data.map((item: any) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            role: item.role,
            program: item.programName,
            email: "-",
            password: "-",
          }));

          const rds = rdResponse.data.map((item: any) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            role: item.role,
            program: "-",
            email: "-",
            password: "-",
          }));

          fetchedData = [...rds, ...pds];
        } else if (role === "Regional Director") {
          const pdResponse = await backend.get("/program-directors/summary");

          fetchedData = pdResponse.data.map((item: any) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            role: "Program Director",
            program: item.programName,
            email: "-",
            password: "-",
          }));
        }

        console.log(fetchedData);

        setUsers(fetchedData);
      } catch (error) {
        console.error("Error loading accounts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [backend, role, roleLoading]);

  return (
    <Box
      p={8}
      bg="white"
      minH="100vh"
    >
      <Flex
        mb={8}
        align="center"
        wrap={{ base: "wrap", md: "nowrap" }}
        gap={4}
      >
        <Heading
          as="h1"
          size="lg"
          fontWeight="500"
        >
          Accounts
        </Heading>

        <AccountToolbar />
      </Flex>

      {isLoading || roleLoading ? (
        <Center py={10}>
          <Spinner
            size="xl"
            color="gray.500"
          />
        </Center>
      ) : users.length === 0 ? (
        <Center py={10}>
          <Text color="gray.500">No accounts found.</Text>
        </Center>
      ) : (
        <AccountsTable data={users} />
      )}
    </Box>
  );
};
