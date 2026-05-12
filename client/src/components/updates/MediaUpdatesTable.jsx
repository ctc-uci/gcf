//TODO: check this again
import { useEffect, useMemo, useState } from 'react';

import {
  Badge,
  Box,
  Button,
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
import { formatRelativeDate } from '@/utils/formatDate';
import { useTranslation } from 'react-i18next';
import { FiEdit2 } from 'react-icons/fi';

import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { DirectorAvatar } from '../dashboard/ProgramForm/DirectorAvatar';
import { SortArrows } from '../tables/SortArrows';
import { ReviewMediaUpdate } from './forms/ReviewMediaUpdate';

export function downloadMediaUpdatesAsCsv(data) {
  const headers = ['Update Note', 'Status', 'Author', 'Program', 'Date'];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.note),
    escapeCsvValue(row.status),
    escapeCsvValue([row.firstName, row.lastName].filter(Boolean).join(' ')),
    escapeCsvValue(row.programName),
    escapeCsvValue(row.updatedAt || row.updateDate),
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
        (formatRelativeDate(update.updatedAt || update.updateDate) || '')
          .toLowerCase()
          .includes(q)
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
                  _hover={{
                    bg: 'gray.50',
                    '& .action-group': { opacity: 1, visibility: 'visible' },
                  }}
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
                      <DirectorAvatar
                        picture={row.picture}
                        name={authorDisplayName(row)}
                        boxSize="24px"
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
                    <HStack
                      justify="space-between"
                      spacing={2}
                      w="100%"
                    >
                      <Text
                        fontSize="sm"
                        color="gray.600"
                      >
                        {formatRelativeDate(row.updatedAt || row.updateDate)}
                      </Text>
                      <Box
                        className="action-group"
                        opacity={{ base: 1, md: 0 }}
                        visibility={{ base: 'visible', md: 'hidden' }}
                        transition="all 0.2s"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FiEdit2 />}
                          colorScheme="teal"
                          bg="white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUpdate(row);
                          }}
                        >
                          {t('common.edit')}
                        </Button>
                      </Box>
                    </HStack>
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
