import { useMemo, useState, useEffect } from 'react';

import {
  Badge,
  Box,
  Center,
  Icon,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  HStack,
  Text,
} from '@chakra-ui/react';
import { FiStar, FiUser } from 'react-icons/fi';
import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';
import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { SortArrows } from '../tables/SortArrows';
import { ProgramUpdateForm } from './ProgramUpdateForm';

export function downloadProgramUpdatesAsCsv(data) {
  const headers = [
    'Flag',
    'Type',
    'Update Note',
    'Status',
    'Author',
    'Program',
    'Date',
  ];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.flagged ? 'Flagged' : ''),
    escapeCsvValue(row.updateType || row.title || ''),
    escapeCsvValue(row.note),
    escapeCsvValue(row.status),
    escapeCsvValue([row.firstName, row.lastName].filter(Boolean).join(' ')),
    escapeCsvValue(row.name),
    escapeCsvValue(row.updateDate),
  ]);
  downloadCsv(headers, rows, `program-updates-${getFilenameTimestamp()}.csv`);
}

const StatusBadge = ({ status }) => {
  const isResolved =
    status?.toLowerCase() === 'resolved' || status?.toLowerCase() === 'active';
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

const TypeBadge = ({ type }) => {
  const label = type || 'Student';
  const isInstrument = label.toLowerCase() === 'instrument';
  return (
    <Badge
      variant="outline"
      borderColor={isInstrument ? 'teal.300' : 'teal.200'}
      color={isInstrument ? 'teal.600' : 'teal.500'}
      bg="white"
      borderRadius="md"
      px={2}
      py={0.5}
      fontSize="xs"
      fontWeight="500"
      textTransform="capitalize"
    >
      {label}
    </Badge>
  );
};

export const ProgramUpdatesTable = ({
  originalData,
  isLoading,
  onSave,
  searchQuery = '',
  embedded = false,
  showStatus = false,
  showFlagAndType = false,
  activeFilters: externalFilters,
}) => {
  const [internalFilters] = useState([]);
  const activeFilters = externalFilters ?? internalFilters;
  const filteredData = useMemo(
    () => applyFilters(activeFilters, originalData),
    [activeFilters, originalData]
  );

  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openEditForm = (update) => {
    setSelectedUpdate(update);
    setIsFormOpen(true);
  };

  const displayData = useMemo(() => {
    if (!searchQuery) return filteredData;
    const q = searchQuery.toLowerCase();
    return filteredData.filter(
      (update) =>
        (update.note || '').toLowerCase().includes(q) ||
        (update.name || '').toLowerCase().includes(q) ||
        (update.fullName || '').toLowerCase().includes(q) ||
        (update.status || '').toLowerCase().includes(q) ||
        (update.updateDate || '').toLowerCase().includes(q)
    );
  }, [searchQuery, filteredData]);

  const [sortedData, setSortedData] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayData]);

  const { sortOrder, handleSort } = useTableSort(displayData, setSortedData);
  const tableData = sortedData ?? displayData;

  return (
    <>
      <ProgramUpdateForm
        isOpen={isFormOpen}
        onOpen={() => setIsFormOpen(true)}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUpdate(null);
        }}
        onSave={onSave}
        programUpdateId={selectedUpdate?.id}
      />

      <Box position="relative">
        <TableContainer overflowX="auto" maxW="100%">
          <Table variant="simple">
            <Thead>
              <Tr>
                {showFlagAndType && (
                  <Th
                    onClick={() => handleSort('flagged')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                    w="60px"
                  >
                    Flag
                    <SortArrows columnKey="flagged" sortOrder={sortOrder} />
                  </Th>
                )}
                {showFlagAndType && (
                  <Th
                    onClick={() => handleSort('updateType')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="600"
                  >
                    Type
                    <SortArrows columnKey="updateType" sortOrder={sortOrder} />
                  </Th>
                )}
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
                {(showStatus || showFlagAndType) && (
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
                )}
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
                  onClick={() => handleSort('name')}
                  cursor="pointer"
                  color="gray.500"
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="600"
                >
                  Program
                  <SortArrows columnKey="name" sortOrder={sortOrder} />
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
              {tableData.length === 0 && isLoading ? (
                <Tr>
                  <Td
                    colSpan={
                      4 +
                      (showStatus || showFlagAndType ? 1 : 0) +
                      (showFlagAndType ? 2 : 0)
                    }
                  >
                    <Center py={8}>
                      <Spinner size="lg" />
                    </Center>
                  </Td>
                </Tr>
              ) : (
                tableData.map((row) => (
                  <Tr
                    key={row.id}
                    onClick={() => openEditForm(row)}
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                  >
                    {showFlagAndType && (
                      <Td>
                        <Icon
                          as={FiStar}
                          boxSize={4}
                          color={row.flagged ? 'teal.500' : 'gray.300'}
                          fill={row.flagged ? 'teal.500' : 'none'}
                        />
                      </Td>
                    )}
                    {showFlagAndType && (
                      <Td>
                        <TypeBadge type={row.updateType || row.title} />
                      </Td>
                    )}
                    <Td>
                      <Text noOfLines={1} maxW="400px">
                        {row.note || 'Note about the program...'}
                      </Text>
                    </Td>
                    {(showStatus || showFlagAndType) && (
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                    )}
                    <Td>
                      <HStack spacing={1}>
                        <Icon as={FiUser} boxSize={4} color="gray.400" />
                        <Text fontSize="sm">{row.firstName || 'Name'}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="500">
                        {row.name || ''}
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
        {isLoading && tableData.length > 0 && (
          <Box
            position="absolute"
            inset={0}
            bg="whiteAlpha.800"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1}
          >
            <Spinner size="lg" />
          </Box>
        )}
      </Box>
    </>
  );
};
