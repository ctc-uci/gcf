//TODO: check this again
import { useEffect, useMemo, useState } from 'react';

import {
  Avatar,
  Badge,
  Box,
  Center,
  HStack,
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

import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';
import { useTranslation } from 'react-i18next';
import { FiUser } from 'react-icons/fi';

import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { SortArrows } from '../tables/SortArrows';
import { ReviewMediaUpdate } from './forms/ReviewMediaUpdate';

function formatDate(dateStr) {
  if (!dateStr) return '';

  let safeDateString = String(dateStr).replace(' ', 'T');
  if (
    !safeDateString.endsWith('Z') &&
    !safeDateString.includes('+') &&
    !safeDateString.includes('-')
  ) {
    safeDateString += 'Z';
  }

  const d = new Date(safeDateString);
  if (isNaN(d.getTime())) return dateStr;

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const isThisYear = d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (isThisYear) {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

export function downloadMediaUpdatesAsCsv(data) {
  const headers = ['Update Note', 'Status', 'Author', 'Program', 'Date'];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.note),
    escapeCsvValue(row.status),
    escapeCsvValue([row.firstName, row.lastName].filter(Boolean).join(' ')),
    escapeCsvValue(row.programName),
    escapeCsvValue(formatDate(row.updatedAt || row.updateDate)),
  ]);
  downloadCsv(headers, rows, `media-updates-${getFilenameTimestamp()}.csv`);
}

const authorDisplayName = (row) =>
  [row.firstName, row.lastName].filter(Boolean).join(' ').trim() ||
  row.fullName?.trim() ||
  '';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const isResolved =
    status?.toLowerCase() === 'resolved' ||
    status?.toLowerCase() === 'approved' ||
    status?.toLowerCase() === 'active';
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

export const MediaUpdatesTable = ({
  data,
  setData,
  originalData,
  isLoading,
  searchQuery = '',
  embedded: _embedded = false,
  activeFilters: externalFilters,
}) => {
  const { t } = useTranslation();
  const [internalFilters] = useState([]);
  const activeFilters = externalFilters ?? internalFilters;

  const filteredData = useMemo(
    () => applyFilters(activeFilters, data ?? originalData ?? []),
    [activeFilters, data, originalData]
  );

  const displayData = useMemo(() => {
    if (!searchQuery) return filteredData;
    const q = searchQuery.toLowerCase();
    return filteredData.filter((update) => {
      const author = (authorDisplayName(update) || '').toLowerCase();
      return (
        (update.note || '').toLowerCase().includes(q) ||
        (update.programName || '').toLowerCase().includes(q) ||
        author.includes(q) ||
        (update.status || '').toLowerCase().includes(q) ||
        (formatDate(update.updatedAt) || '').toLowerCase().includes(q)
      );
    });
  }, [searchQuery, filteredData]);

  const [sortedData, setSortedData] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayData]);

  const { sortOrder, handleSort } = useTableSort(displayData, setSortedData);
  const tableData = sortedData ?? displayData;

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
                onClick={() => handleSort('note')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colUpdateNote')}
                <SortArrows
                  columnKey="note"
                  sortOrder={sortOrder}
                />
              </Th>
              <Th
                onClick={() => handleSort('status')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colStatus')}
                <SortArrows
                  columnKey="status"
                  sortOrder={sortOrder}
                />
              </Th>
              <Th
                onClick={() => handleSort('fullName')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colAuthor')}
                <SortArrows
                  columnKey="firstName"
                  sortOrder={sortOrder}
                />
              </Th>
              <Th
                onClick={() => handleSort('programName')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colProgram')}
                <SortArrows
                  columnKey="programName"
                  sortOrder={sortOrder}
                />
              </Th>
              <Th
                onClick={() => handleSort('updateDate')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                {t('updates.colDate')}
                <SortArrows
                  columnKey="updateDate"
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
                      {row.note || t('updates.programNotePlaceholder')}
                    </Text>
                  </Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Avatar
                        size="xs"
                        name={authorDisplayName(row) || undefined}
                        bg="teal.500"
                        color="white"
                      />
                      <Text fontSize="sm">
                        {authorDisplayName(row) || t('common.name')}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text
                      fontSize="sm"
                      fontWeight="500"
                    >
                      {row.programName || ''}
                    </Text>
                  </Td>
                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                    >
                      {formatDate(row.updatedAt)}
                    </Text>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
      {selectedUpdate && (
        <ReviewMediaUpdate
          update={selectedUpdate}
          onClose={() => setSelectedUpdate(null)}
          onUpdate={setData}
        />
      )}
    </Box>
  );
};
