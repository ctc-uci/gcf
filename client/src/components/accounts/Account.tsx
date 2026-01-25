import { useEffect, useState } from "react";

import { Box, Center, Flex, Heading, Spinner, Text } from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { GcfUserAccount } from "@/types/gcf-user";
import { useParams } from "react-router-dom";

import { AccountsTable, GcfUserTableData } from "./AccountsTable";
import { AccountToolbar } from "./AccountToolbar";

export const Account = () => {
  const { userId } = useParams();

  const [currentUser, setCurrentUser] = useState<GcfUserAccount | null>(null);
  const [users, setUsers] = useState<GcfUserTableData[]>([]);
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

        setCurrentUser(userData);

        if (!userData) {
          console.error("Current user data is null");
          setIsLoading(false);
          return;
        }

        let fetchedData: GcfUserTableData[] = [];

        if (userData.role === "Admin") {
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
        } else if (userData.role === "Regional Director") {
          const pdResponse = await backend.get(
            `/regional-directors/${userId}/program-directors`
          );

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
