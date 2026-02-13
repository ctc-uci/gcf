import { useCallback, useEffect, useState } from "react";

import { Box, Center, Flex, Heading, Spinner } from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";

import { AccountsTable } from "./AccountsTable";
import { AccountToolbar } from "./AccountToolbar";
import { AccountForm } from "./AccountForm";

const getAccountsRoute = (role, userId) => {
  if (!userId) return null;

  return role
    ? `/gcf-users/${userId}/accounts?role=${role}`
    : `/gcf-users/${userId}/accounts`;
};


export const Account = () => {
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();
  const userId = currentUser?.uid;

  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const [selectedUser, setSelectedUser] = useState(null);

  const { backend } = useBackendContext();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const route = getAccountsRoute(role, userId);
    if (!route) {
      console.error("No valid route for accounts. Missing userId or role.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await backend.get(route);
      const rawData = response.data || []
      const fetchedData = (rawData).map((item) => ({
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        role: item.role,
        programs: Array.isArray(item.programs) ? item.programs : [],
        email: item.email ?? "-",
        password: "-",
      }));

      setUsers(fetchedData);
      setOriginalUsers(fetchedData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [backend, role, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

        <AccountToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onNew = {() => {
          setIsDrawerOpen(true);
          setSelectedUser(null)
        }}/>
      </Flex>

      {isLoading ? (
        <Center py={10}>
          <Spinner
            size="xl"
            color="gray.500"
          />
        </Center>
      ) : (
        <AccountsTable
          data={users}
          setData={setUsers}
          originalData={originalUsers}
          searchQuery={searchQuery}
          onUpdate = {(user) => {
            setSelectedUser(user)
            setIsDrawerOpen(true)
          }}
        />
      )}
      <AccountForm targetUser = {selectedUser} isOpen = { isDrawerOpen } onClose = {() => setIsDrawerOpen(false)} onSave = {() => fetchData()}></AccountForm>
    </Box>
  );
};
