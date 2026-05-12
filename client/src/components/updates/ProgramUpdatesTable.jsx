import { useEffect, useMemo, useState } from 'react';

import {
  Badge,
  Box,
  Button,
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

import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';
import { formatRelativeDate } from '@/utils/formatDate';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiStar } from 'react-icons/fi';

import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { DirectorAvatar } from '../dashboard/ProgramForm/DirectorAvatar';
import { SortArrows } from '../tables/SortArrows';
import { ProgramUpdateForm } from './forms/ProgramUpdateForm';

function getProgramUpdateStatusLabel(row, t) {
  return row?.resolved ? t('common.resolved') : t('common.unresolved');
}

export function downloadProgramUpdatesAsCsv(data, t) {
  const headers = [
    t('updates.csvFlag'),
    t('updates.csvType'),
    t('updates.csvUpdateNote'),
    t('updates.csvStatus'),
    t('updates.csvAuthor'),
    t('updates.csvProgram'),
    t('updates.csvDate'),
  ];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.flagged ? t('updates.csvFlagged') : ''),
    escapeCsvValue(row.updateType || row.title || ''),
    escapeCsvValue(row.note),
    escapeCsvValue(getProgramUpdateStatusLabel(row, t)),
    escapeCsvValue([row.firstName, row.lastName].filter(Boolean).join(' ')),
    escapeCsvValue(row.name),
    escapeCsvValue(formatRelativeDate(row.updatedAt || row.updateDate)),
  ]);
  downloadCsv(headers, rows, `program-updates-${getFilenameTimestamp()}.csv`);
}

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const isResolved = status;
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

const TypeBadge = ({ type }) => {
  const { t } = useTranslation();
  const isInstrument = (type || '').toLowerCase() === 'instrument';
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
      {isInstrument ? t('updates.typeInstrument') : t('updates.typeStudent')}
    </Badge>
  );
};

export const ProgramUpdatesTable = ({
  originalData,
  isLoading,
  onSave,
  searchQuery = '',
  showStatus = false,
  showFlagAndType = false,
  activeFilters: externalFilters,
}) => {
  const { t } = useTranslation();
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
        (update.title || '').toLowerCase().includes(q) ||
        (update.name || '').toLowerCase().includes(q) ||
        (update.fullName || '').toLowerCase().includes(q) ||
        getProgramUpdateStatusLabel(update, t).toLowerCase().includes(q) ||
        (formatRelativeDate(update.updatedAt || update.updateDate) || '')
          .toLowerCase()
          .includes(q)
    );
  }, [searchQuery, filteredData, t]);

  const displayDataWithDefaultSort = useMemo(() => {
    const getUpdateTime = (value) => {
      if (!value) return 0;
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    return [...displayData].sort(
      (a, b) =>
        getUpdateTime(b.updatedAt || b.updateDate) -
        getUpdateTime(a.updatedAt || a.updateDate)
    );
  }, [displayData]);

  const [sortedData, setSortedData] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayDataWithDefaultSort]);

  const { sortOrder, handleSort } = useTableSort(
    displayDataWithDefaultSort,
    setSortedData
  );
  const tableData = sortedData ?? displayDataWithDefaultSort;

  return (
    <>
      {/* TODO: create a StudentUpdateForm with edit functionality */}
      <ProgramUpdateForm
        isOpen={isFormOpen}
        onOpen={() => setIsFormOpen(true)}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUpdate(null);
        }}
        onSuccess={onSave}
        programUpdateId={selectedUpdate?.id}
        isInstrumentUpdate={selectedUpdate?.isInstrumentUpdate}
        selectedUpdate={selectedUpdate}
      />

      <Box position="relative">
        <TableContainer
          overflowX="auto"
          maxW="100%"
        >
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
                    {t('updates.colFlag')}
                    <SortArrows
                      columnKey="flagged"
                      sortOrder={sortOrder}
                    />
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
                    {t('updates.colType')}
                    <SortArrows
                      columnKey="updateType"
                      sortOrder={sortOrder}
                    />
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
                  {t('updates.colUpdateNote')}
                  <SortArrows
                    columnKey="note"
                    sortOrder={sortOrder}
                  />
                </Th>
                {(showStatus || showFlagAndType) && (
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
                )}
                <Th
                  onClick={() => handleSort('firstName')}
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
                  onClick={() => handleSort('name')}
                  cursor="pointer"
                  color="gray.500"
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="600"
                >
                  {t('updates.colProgram')}
                  <SortArrows
                    columnKey="name"
                    sortOrder={sortOrder}
                  />
                </Th>
                <Th
                  onClick={() => handleSort('updatedAt')}
                  cursor="pointer"
                  color="gray.500"
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="600"
                >
                  {t('updates.colDate')}
                  <SortArrows
                    columnKey="updatedAt"
                    sortOrder={sortOrder}
                  />
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
                    _hover={{
                      bg: 'gray.50',
                      '& .action-group': { opacity: 1, visibility: 'visible' },
                    }}
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
                        <TypeBadge
                          type={
                            row.isInstrumentUpdate ? 'instrument' : 'student'
                          }
                        />
                      </Td>
                    )}
                    <Td>
                      <Text
                        noOfLines={1}
                        maxW="400px"
                      >
                        {row.note ||
                          row.title ||
                          t('updates.programNotePlaceholder')}
                      </Text>
                    </Td>
                    {(showStatus || showFlagAndType) && (
                      <Td>
                        <StatusBadge status={row.resolved} />
                      </Td>
                    )}
                    <Td>
                      <HStack spacing={2}>
                        <DirectorAvatar
                          picture={row.picture}
                          name={
                            [row.firstName, row.lastName]
                              .filter(Boolean)
                              .join(' ') || ''
                          }
                          boxSize="24px"
                        />
                        <Text fontSize="sm">
                          {[row.firstName, row.lastName]
                            .filter(Boolean)
                            .join(' ') || t('common.emDash')}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text
                        fontSize="sm"
                        fontWeight="500"
                      >
                        {row.name || ''}
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
                              openEditForm(row);
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
