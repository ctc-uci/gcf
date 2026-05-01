import { useCallback, useEffect, useState } from 'react';

import { DownloadIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { useTranslation } from 'react-i18next';

import { AccountForm } from './AccountForm';
import { AccountsTable, downloadAccountsAsCsv } from './AccountsTable';
import { AccountToolbar } from './AccountToolbar';

const getAccountsRoute = (role, userId) => {
  if (!userId) return null;

  return role
    ? `/gcf-users/${userId}/accounts?role=${role}`
    : `/gcf-users/${userId}/accounts`;
};

export const Account = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();
  const userId = currentUser?.uid;

  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCardView, setIsCardView] = useState(false);
  const columns = [
    {
      key: 'fullName',
      type: 'text',
    },
    {
      key: 'email',
      type: 'text',
    },
    {
      key: 'role',
      type: 'text',
    },
    {
      key: 'programs',
      type: 'list',
    },
  ];

  const { backend } = useBackendContext();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const route = getAccountsRoute(role, userId);
    if (!route) {
      console.error('No valid route for accounts. Missing userId or role.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await backend.get(route);
      const rawData = response.data || [];
      const fetchedData = rawData.map((item) => ({
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        fullName: `${item.firstName} ${item.lastName}`,
        role: item.role,
        programs: Array.isArray(item.programs) ? item.programs : [],
        email: item.email ?? '-',
        createdBy: item.createdByName || item.createdBy || '',
        picture: item.picture || '',
        createdByPicture: item.createdByPicture || '',
        region: Array.isArray(item.region) ? item.region : [],
      }));

      setUsers(fetchedData);
      setOriginalUsers(fetchedData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [backend, role, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [activeFilters, setActiveFilters] = useState([]);

  return (
    <Box
      p={8}
      bg="gray.50"
      minH="94vh"
      mt={0}
      w="100%"
      maxW="100%"
      minW={0}
      overflowX="hidden"
    >
      <Flex
        mb={8}
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={3}
        rowGap={3}
        w="100%"
        minW={0}
      >
        <HStack
          spacing={2}
          flexShrink={0}
        >
          <Heading
            as="h1"
            size="lg"
            fontWeight="600"
            color="blackAlpha.900"
          >
            {t('accounts.title')}
          </Heading>
          <IconButton
            icon={<DownloadIcon />}
            variant="ghost"
            size="sm"
            aria-label={t('accounts.downloadAria')}
            color="gray.600"
            onClick={() => downloadAccountsAsCsv(users, t)}
          />
        </HStack>

        <Box
          flex="1"
          minW={0}
          ml={{ base: 0, md: 4 }}
        >
          <AccountToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onNew={() => {
              setIsDrawerOpen(true);
              setSelectedUser(null);
            }}
            setIsCardView={setIsCardView}
            isCardView={isCardView}
            columns={columns}
            onFilterChange={(filters) => setActiveFilters(filters)}
          />
        </Box>
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
          originalData={originalUsers}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
          isCardView={isCardView}
          showCreatedBy={role === 'Admin' || role === 'Super Admin'}
          onSave={() => fetchData()}
          onUpdate={(user) => {
            setSelectedUser(user);
            setIsDrawerOpen(true);
          }}
        />
      )}
      <AccountForm
        targetUser={selectedUser}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={() => fetchData()}
      ></AccountForm>
    </Box>
  );
};
