import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';

const ACCOUNT_TYPE_TAG_STYLES = {
  'regional director': {
    label: 'Regional Director',
    bg: '#e0f2f1',
    color: '#00796b',
  },
  'program director': {
    label: 'Program Director',
    bg: '#fff3e0',
    color: '#ef6c00',
  },
};

function AccountTypeTag({ role }) {
  const normalized = String(role ?? '').toLowerCase();
  const style = ACCOUNT_TYPE_TAG_STYLES[normalized] ?? {
    label: role ?? '—',
    bg: 'gray.100',
    color: 'gray.700',
  };
  return (
    <Box
      as="span"
      display="inline-block"
      px={2}
      py={0.5}
      borderRadius="md"
      fontSize="sm"
      fontWeight="medium"
      bg={style.bg}
      color={style.color}
    >
      {style.label}
    </Box>
  );
}

import { FiEdit2, FiEyeOff } from 'react-icons/fi';

import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';

import CardView from './CardView';
import { EmptyStateBadge } from '../badges/EmptyStateBadge';

export function downloadAccountsAsCsv(data) {
  const headers = ['First Name', 'Last Name', 'Email', 'Type', 'Program(s)'];
  const rows = (data || []).map((user) => [
    escapeCsvValue(user.firstName),
    escapeCsvValue(user.lastName),
    escapeCsvValue(user.email),
    escapeCsvValue(user.role),
    escapeCsvValue(
      Array.isArray(user.programs) ? user.programs.join('; ') : ''
    ),
  ]);
  downloadCsv(headers, rows, `accounts-${getFilenameTimestamp()}.csv`);
}
import { useTableSort } from '../../contexts/hooks/TableSort';
import { SortArrows } from '../tables/SortArrows';
import { useMemo, useEffect, useState } from 'react';
import { applyFilters } from '../../contexts/hooks/TableFilter';

export const AccountsTable = ({
  originalData,
  searchQuery,
  activeFilters,
  isCardView,
  onSave,
  onUpdate,
}) => {
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const filteredData = useMemo(
    () => applyFilters(activeFilters, originalData ?? []),
    [activeFilters, originalData]
  );

  const displayData = useMemo(() => {
    if (!searchQuery) return filteredData;
    const query = searchQuery.toLowerCase();

    return filteredData.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`
        .trim()
        .toLowerCase();

      return (
        fullName.includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.programs?.some((p) => p.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, filteredData]);

  const [sortedData, setSortedData] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayData]);

  const { sortOrder, handleSort } = useTableSort(displayData, setSortedData);
  const tableData = sortedData ?? displayData;

  if (!isCardView && (!tableData || tableData.length === 0)) {
    return (
      <TableContainer w="full" maxW="100%" overflowX="auto">
        <EmptyStateBadge variant="no-accounts" />
      </TableContainer>
    );
  }

  return (
    <TableContainer maxW="80vw">
      {!isCardView ? (
        <Table
          variant="unstyled"
          size="md"
          sx={{
            border: '1px solid',
            borderColor: 'gray.200',
            borderRadius: 'md',
          }}
        >
          <Thead>
            <Tr
              sx={{
                '& th': {
                  borderBottom: '1px solid',
                  borderColor: 'gray.200',
                  color: 'gray.700',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: 'xs',
                },
              }}
            >
              <Th onClick={() => handleSort('firstName')} cursor="pointer">
                Name
                <SortArrows columnKey="firstName" sortOrder={sortOrder} />
              </Th>
              <Th onClick={() => handleSort('email')} cursor="pointer">
                Email
                <SortArrows columnKey="email" sortOrder={sortOrder} />
              </Th>
              <Th onClick={() => handleSort('password')} cursor="pointer">
                Password
                <SortArrows columnKey="passsword" sortOrder={sortOrder} />
              </Th>
              <Th onClick={() => handleSort('role')} cursor="pointer">
                Type
                <SortArrows columnKey="role" sortOrder={sortOrder} />
              </Th>
              <Th onClick={() => handleSort('programs')} cursor="pointer">
                Program(s)
                <SortArrows columnKey="programs" sortOrder={sortOrder} />
              </Th>
              <Th width="50px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableData.map((user) => (
              <Tr
                key={user.id}
                _hover={{
                  bg: hoverBg,
                  '& .action-group': { opacity: 1, visibility: 'visible' },
                }}
                transition="background 0.2s"
                sx={{
                  '& td': {
                    borderBottom: '1px solid',
                    borderColor: 'gray.200',
                  },
                }}
              >
                <Td fontWeight="medium">
                  {user.firstName} {user.lastName}
                </Td>

                <Td>{user.email}</Td>

                <Td>
                  <HStack spacing={2}>
                    {/* TODO: Update to utilize password field when data is available + hidden functionality */}
                    <Text fontSize="lg" lineHeight="1" mt="6px">
                      ********
                    </Text>
                    <Icon as={FiEyeOff} color="gray.500" cursor="pointer" />
                  </HStack>
                </Td>

                <Td>
                  <AccountTypeTag role={user.role} />
                </Td>

                <Td>
                  {Array.isArray(user.programs) && user.programs.length > 0
                    ? user.programs.join(', ')
                    : '-'}
                </Td>

                <Td p={0} textAlign="right">
                  <Box
                    className="action-group"
                    opacity={0}
                    visibility="hidden"
                    transition="all 0.2s"
                    pr={4}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FiEdit2 />}
                      colorScheme="gray"
                      bg="white"
                      onClick={() => onUpdate(user)}
                    >
                      Update
                    </Button>
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <CardView data={data} onSave={onSave} />
      )}
    </TableContainer>
  );
};
