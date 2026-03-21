import { useEffect, useMemo, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, AddIcon } from '@chakra-ui/icons';
import { FiDownload } from 'react-icons/fi';

import { downloadProgramUpdatesAsCsv } from './ProgramUpdatesTable';
import { CreateUpdateDrawer } from './CreateUpdateDrawer';
import { UpdatesEmptyState } from './UpdatesEmptyState';
import {
  UpdatesSearchInput,
  UpdatesFilterPopover,
  UpdatesSortButton,
  UpdatesViewModeToggle,
} from './UpdatesSharedControls';
import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { SortArrows } from '../tables/SortArrows';
import { programDirectorFilterColumns } from './updatesColumnConfig';

const PDStatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  let bg = 'gray.100';
  let color = 'gray.700';
  if (s === 'pending' || s === 'unresolved') {
    bg = 'red.100';
    color = 'red.600';
  } else if (
    s === 'reviewed' ||
    s === 'resolved' ||
    s === 'approved' ||
    s === 'active'
  ) {
    bg = 'green.100';
    color = 'green.600';
  }
  return (
    <Badge
      bg={bg}
      color={color}
      borderRadius="full"
      px={3}
      py={1}
      fontSize="xs"
      fontWeight="500"
      textTransform="capitalize"
    >
      {status || 'Pending'}
    </Badge>
  );
};

export const ProgramDirectorView = ({ data, isLoading, onSave }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const createDrawerDisclosure = useDisclosure();

  const filteredData = useMemo(
    () => applyFilters(activeFilters, data),
    [activeFilters, data]
  );

  const displayData = useMemo(() => {
    if (!searchQuery) return filteredData;
    const q = searchQuery.toLowerCase();
    return filteredData.filter(
      (row) =>
        (row.instrumentName || row.title || '').toLowerCase().includes(q) ||
        (row.note || '').toLowerCase().includes(q) ||
        (row.status || '').toLowerCase().includes(q) ||
        (row.updateDate || '').toLowerCase().includes(q)
    );
  }, [searchQuery, filteredData]);

  const [sortedData, setSortedData] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayData]);

  const { sortOrder, handleSort } = useTableSort(displayData, setSortedData);
  const tableData = sortedData ?? displayData;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh" mx={-4} mt={0}>
      <Flex align="center" gap={4} mb={4} wrap="wrap">
        <HStack
          spacing={2}
          cursor="pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Icon
            as={isCollapsed ? ChevronUpIcon : ChevronDownIcon}
            boxSize={5}
            color="gray.500"
          />
          <Heading as="h1" size="lg" fontWeight="500">
            Updates
          </Heading>
        </HStack>

        <UpdatesSearchInput value={searchQuery} onChange={setSearchQuery} />
        <UpdatesFilterPopover
          columns={programDirectorFilterColumns}
          onFilterChange={setActiveFilters}
        />
        <UpdatesSortButton />
        <UpdatesViewModeToggle />

        <IconButton
          icon={<FiDownload />}
          variant="ghost"
          size="sm"
          aria-label="Download updates"
          color="gray.500"
          onClick={() => downloadProgramUpdatesAsCsv(data)}
        />

        <Button
          bg="teal.500"
          color="white"
          _hover={{ bg: 'teal.600' }}
          size="sm"
          borderRadius="md"
          leftIcon={<AddIcon boxSize={3} />}
          onClick={createDrawerDisclosure.onOpen}
        >
          New
        </Button>
      </Flex>

      {!isCollapsed && (
        <Box position="relative" bg="white" borderRadius="xl" overflow="hidden">
          {tableData.length === 0 && !isLoading ? (
            <UpdatesEmptyState />
          ) : (
            <TableContainer overflowX="auto" maxW="100%">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th
                      onClick={() => handleSort('updateDate')}
                      cursor="pointer"
                      color="gray.500"
                      fontSize="xs"
                      textTransform="uppercase"
                      fontWeight="600"
                    >
                      Date
                      <SortArrows
                        columnKey="updateDate"
                        sortOrder={sortOrder}
                      />
                    </Th>
                    <Th
                      onClick={() => handleSort('instrumentName')}
                      cursor="pointer"
                      color="gray.500"
                      fontSize="xs"
                      textTransform="uppercase"
                      fontWeight="600"
                    >
                      Instrument
                      <SortArrows
                        columnKey="instrumentName"
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
                      Status
                      <SortArrows columnKey="status" sortOrder={sortOrder} />
                    </Th>
                    <Th
                      onClick={() => handleSort('note')}
                      cursor="pointer"
                      color="gray.500"
                      fontSize="xs"
                      textTransform="uppercase"
                      fontWeight="600"
                    >
                      Notes
                      <SortArrows columnKey="note" sortOrder={sortOrder} />
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading && tableData.length === 0 ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Center py={8}>
                          <Spinner size="lg" />
                        </Center>
                      </Td>
                    </Tr>
                  ) : (
                    tableData.map((row) => (
                      <Tr key={row.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Text fontSize="sm" color="gray.700">
                            {formatDate(row.updateDate)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            bg="gray.100"
                            color="gray.700"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            fontWeight="500"
                          >
                            {row.instrumentName || row.title || '—'}
                          </Badge>
                        </Td>
                        <Td>
                          <PDStatusBadge status={row.status} />
                        </Td>
                        <Td>
                          <Textarea
                            size="sm"
                            variant="outline"
                            borderColor="gray.200"
                            borderRadius="md"
                            placeholder="Notes"
                            defaultValue={row.note || ''}
                            minH="32px"
                            h="32px"
                            resize="vertical"
                            fontSize="sm"
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          )}
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
      )}

      <CreateUpdateDrawer
        isOpen={createDrawerDisclosure.isOpen}
        onClose={createDrawerDisclosure.onClose}
        onSave={onSave}
      />
    </Box>
  );
};
