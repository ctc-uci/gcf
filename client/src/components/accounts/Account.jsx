import { useEffect, useState } from "react";

import { Box, Center, Flex, Heading, Spinner, Text } from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

import { AccountsTable } from "./AccountsTable";
import { AccountToolbar } from "./AccountToolbar";

export const Account = () => {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { backend } = useBackendContext();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (!userId) {
        console.error("No userId found in params");
        setIsLoading(false);
        return;
      }

      try {
        const currentUserResponse = await backend.get(`/gcf-users/${userId}`);
        const userData = currentUserResponse.data;

        if (!userData) {
          console.error("Current user data is null");

          setIsLoading(false);
          return;
        }

        let fetchedData = [];

        if (userData.role === "Admin") {
          const response = await backend.get(
            `/gcf-users/${userData.id}/accounts`
          );

          // TODO: Update email and password fields when data is available
          fetchedData = response.data.map((item) => {
            let programs = [];

            if (item.role === "Regional Director") {
              programs = item.programs || [];
            } else if (item.programName) {
              programs = [item.programName];
            }

            return {
              id: item.id,
              firstName: item.firstName,
              lastName: item.lastName,
              role: item.role,
              programs: programs,
              email: "-",
              password: "-",
            };
          });
        } else if (userData.role === "Regional Director") {
          const programDirectorResponse = await backend.get(
            `/regional-directors/${userId}/program-directors`
          );

          // TODO: Update email and password fields when data is available
          fetchedData = programDirectorResponse.data.map((item) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
            role: "Program Director",
            programs: item.programName ? [item.programName] : [],
            email: "-",
            password: "-",
          }));
        }

        setUsers(fetchedData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [backend, userId]);

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

      {isLoading ? (
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
