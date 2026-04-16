import { useEffect, useMemo, useState } from 'react';

import {
  Badge,
  Box,
  Center,
  HStack,
  Icon,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { FiUser } from 'react-icons/fi';

import { useTableSort } from '../../contexts/hooks/TableSort';
import { SortArrows } from '../tables/SortArrows';
import { AccountUpdateDrawer } from './forms/AccountUpdateDrawer';

const StatusBadge = ({ status, adminName }) => {
  const { t } = useTranslation();
  const hasAdmin = adminName && adminName.trim();
  const isResolved = status;

  if (hasAdmin) {
    return (
      <HStack spacing={1}>
        <Icon
          as={FiUser}
          boxSize={3}
          color={isResolved ? 'gray.500' : 'teal.500'}
        />
        <Text
          fontSize="xs"
          bg={isResolved ? 'transparent' : 'teal.50'}
          color={isResolved ? 'gray.600' : 'teal.600'}
          borderRadius="md"
          px={isResolved ? 0 : 2}
          py={0.5}
        >
          {adminName}
        </Text>
      </HStack>
    );
  }

  return (
    <Badge
      bg={isResolved ? 'gray.100' : 'red.100'}
      color={isResolved ? 'gray.700' : 'red.700'}
      borderRadius="md"
      px={2}
      py={0.5}
      fontSize="xs"
      fontWeight="500"
      textTransform="capitalize"
    >
      {isResolved ? t('common.resolved') : t('common.unresolved')}
    </Badge>
  );
};

export const AccountUpdatesTable = ({
  data = [],
  originalData = [],
  isLoading = false,
  searchQuery = '',
  onAccountChangeUpdated,
}) => {
  const { t } = useTranslation();
  const sourceData = useMemo(
    () => data ?? originalData ?? [],
    [data, originalData]
  );

  const displayData = useMemo(() => {
    if (!searchQuery) return sourceData;
    const q = searchQuery.toLowerCase();
    return sourceData.filter(
      (update) =>
        (update.note || '').toLowerCase().includes(q) ||
        (update.changeType || '').toLowerCase().includes(q) ||
        (update.programName || '').toLowerCase().includes(q) ||
        (update.fullName || '').toLowerCase().includes(q) ||
        (update.lastModified || '').toLowerCase().includes(q) ||
        `${update.authorFirstName || ''} ${update.authorLastName || ''}`
          .toLowerCase()
          .trim()
          .includes(q)
    );
  }, [searchQuery, sourceData]);

  const displayDataWithSortKeys = useMemo(() => {
    const withKeys = displayData.map((row) => ({
      ...row,
      authorSortKey: [row.authorFirstName, row.authorLastName]
        .filter(Boolean)
        .join(' ')
        .trim(),
    }));
    const lastModifiedTime = (v) => {
      if (v === null || v === undefined || v === '') return 0;
      const t = new Date(v).getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    // Newest first by default (matches program updates API: ORDER BY update_date DESC)
    return [...withKeys].sort(
      (a, b) =>
        lastModifiedTime(b.lastModified) - lastModifiedTime(a.lastModified)
    );
  }, [displayData]);

  const [sortedData, setSortedData] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayDataWithSortKeys]);

  const { sortOrder, handleSort } = useTableSort(
    displayDataWithSortKeys,
    setSortedData
  );
  const tableData = sortedData ?? displayDataWithSortKeys;

  const changeTypeToText = (changeType) => {
    switch (changeType) {
      case 'Creation':
        return 'created';
      case 'Update':
        return 'updated';
      case 'Deletion':
        return 'deleted';
      default:
        return 'changed';
    }
  };

  return (
    <Box position="relative">
      <TableContainer
        overflowX="auto"
        maxW="100%"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th
                onClick={() => handleSort('changeType')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colUpdateNote')}
                <SortArrows
                  columnKey="changeType"
                  sortOrder={sortOrder}
                />
              </Th>
              <Th
                onClick={() => handleSort('resolved')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colStatus')}
                <SortArrows
                  columnKey="resolved"
                  sortOrder={sortOrder}
                />
              </Th>
              <Th
                onClick={() => handleSort('authorSortKey')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colAuthor')}
                <SortArrows
                  columnKey="authorSortKey"
                  sortOrder={sortOrder}
                />
              </Th>

              <Th
                onClick={() => handleSort('lastModified')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colDate')}
                <SortArrows
                  columnKey="lastModified"
                  sortOrder={sortOrder}
                />
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={5}>
                  <Center py={8}>
                    <Spinner size="lg" />
                  </Center>
                </Td>
              </Tr>
            ) : (
              tableData.map((row) => (
                <Tr
                  key={row.id}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => setSelectedUpdate(row)}
                >
                  <Td>
                    <Text
                      noOfLines={1}
                      maxW="400px"
                    >
                      {/* {row.note || t('updates.accountNotePlaceholder')} */}
                      {row.changeType
                        ? `Account has been ${changeTypeToText(row.changeType)}.`
                        : t('updates.accountNotePlaceholder')}
                    </Text>
                  </Td>
                  <Td>
                    <StatusBadge
                      status={row.resolved}
                      adminName={row.resolvedBy}
                    />
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Icon
                        as={FiUser}
                        boxSize={4}
                        color="gray.400"
                      />
                      <Text fontSize="sm">
                        {row.authorFirstName && row.authorLastName
                          ? `${row.authorFirstName} ${row.authorLastName}`
                          : t('common.name')}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                    >
                      {row.lastModified || ''}
                    </Text>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
      {selectedUpdate && (
        <AccountUpdateDrawer
          update={selectedUpdate}
          onClose={() => setSelectedUpdate(null)}
          onAccountChangeUpdated={onAccountChangeUpdated}
        />
      )}
    </Box>
  );
};
