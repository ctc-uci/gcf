import { useEffect, useState } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  Spinner, 
  Center, 
  Text
} from "@chakra-ui/react";
import { AccountsTable } from "./AccountsTable";
import { AccountToolbar } from "./AccountToolbar";
import { GcfUserAccount } from "@/types/gcf-user";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

export const Account = () => {
  const [users, setUsers] = useState<GcfUserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { backend } = useBackendContext();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await backend.get("/gcf-users"); 
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  });

  console.log(users);

  return (
    <Box p={8} bg="white" minH="100vh">
      <Flex 
        mb={8} 
        align="center" 
        wrap={{ base: "wrap", md: "nowrap" }} 
        gap={4}
      >
        <Heading as="h1" size="lg" fontWeight="500">
          Accounts
        </Heading>
        
        <AccountToolbar/>
      </Flex>

      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" color="gray.500" />
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