import { useMemo, useState, useEffect } from 'react';

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
import { FiUser } from 'react-icons/fi';

import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';
import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { SortArrows } from '../tables/SortArrows';
import { ReviewMediaUpdate } from './ReviewMediaUpdate';

export function downloadMediaUpdatesAsCsv(data) {
  const headers = ['Update Note', 'Status', 'Author', 'Program', 'Date'];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.note),
    escapeCsvValue(row.status),
    escapeCsvValue([row.firstName, row.lastName].filter(Boolean).join(' ')),
    escapeCsvValue(row.programName),
    escapeCsvValue(row.updateDate),
  ]);
  downloadCsv(headers, rows, `media-updates-${getFilenameTimestamp()}.csv`);
}

const StatusBadge = ({ status }) => {
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
      {isResolved ? 'Resolved' : 'Unresolved'}
    </Badge>
  );
};

export const MediaUpdatesTable = ({
  data,
  setData,
  originalData,
  isLoading,
  searchQuery = '',
  embedded = false,
  activeFilters: externalFilters,
}) => {
  console.log(data);
  const [internalFilters] = useState([]);
  const activeFilters = externalFilters ?? internalFilters;

  const sourceData = data ?? originalData ?? [];

  const filteredData = useMemo(
    () => applyFilters(activeFilters, sourceData),
    [activeFilters, sourceData]
  );

  const displayData = useMemo(() => {
    if (!searchQuery) return filteredData;
    const q = searchQuery.toLowerCase();
    return filteredData.filter(
      (update) =>
        (update.note || '').toLowerCase().includes(q) ||
        (update.programName || '').toLowerCase().includes(q) ||
        (update.fullName || '').toLowerCase().includes(q) ||
        (update.status || '').toLowerCase().includes(q) ||
        (update.updateDate || '').toLowerCase().includes(q)
    );
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
      <TableContainer overflowX="auto" maxW="100%">
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
                Update Note
                <SortArrows columnKey="note" sortOrder={sortOrder} />
              </Th>
              <Th
                onClick={() => handleSort('status')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                Status
                <SortArrows columnKey="status" sortOrder={sortOrder} />
              </Th>
              <Th
                onClick={() => handleSort('firstName')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                Author
                <SortArrows columnKey="firstName" sortOrder={sortOrder} />
              </Th>
              <Th
                onClick={() => handleSort('programName')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                Program
                <SortArrows columnKey="programName" sortOrder={sortOrder} />
              </Th>
              <Th
                onClick={() => handleSort('updateDate')}
                cursor="pointer"
                color="gray.500"
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="600"
              >
                Date
                <SortArrows columnKey="updateDate" sortOrder={sortOrder} />
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
                    <Text noOfLines={1} maxW="400px">
                      {row.note || 'Note about the program...'}
                    </Text>
                  </Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Icon as={FiUser} boxSize={4} color="gray.400" />
                      <Text fontSize="sm">{row.firstName || 'Name'}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="500">
                      {row.programName || ''}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      {row.updateDate || ''}
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
