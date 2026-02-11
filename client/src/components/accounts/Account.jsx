import { useEffect, useState } from "react";

import { Box, Center, Flex, Heading, Spinner } from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useParams } from "react-router-dom";

import { AccountsTable } from "./AccountsTable";
import { AccountToolbar } from "./AccountToolbar";

export const Account = () => {
  // TODO(login): Replace useParams userId with AuthContext (currentUser?.uid) when auth flow is finalized.
  const { userId } = useParams();

  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { backend } = useBackendContext();
  // TODO: potentially create toggleable view for ALL accounts vs. only accounts created by the current user
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (!userId) {
        console.error("No userId found in params");
        setIsLoading(false);
        return;
      }

      try {
        const response = await backend.get(`/gcf-users/${userId}/accounts`);

        // TODO: Update email and password fields when data is available
        const fetchedData = (response.data || []).map((item) => ({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
          role: item.role,
          programs: Array.isArray(item.programs) ? item.programs : [],
          email: "-",
          password: "-",
        }));

        setUsers(fetchedData);
        setOriginalUsers(fetchedData);
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

        <AccountToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </Flex>

      {isLoading ? (
        <Center py={10}>
          <Spinner
            size="xl"
            color="gray.500"
          />
        </Center>
      ) 
      : (
        <AccountsTable data={users} setData={setUsers} originalData={originalUsers} searchQuery={searchQuery}/>
      )}
    </Box>
  );
};
