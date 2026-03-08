import { useMemo, useState, useEffect } from 'react';

import {
  AddIcon,
  DownloadIcon,
  HamburgerIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  IconButton,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { FilterComponent } from '../common/FilterComponent';
import { SortArrows } from '../tables/SortArrows';
import { ProgramUpdateForm } from './ProgramUpdateForm';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { EmptyStateBadge } from '../badges/EmptyStateBadge';

const PROGRAM_STATUS_TAG_STYLES = {
  active: { label: 'Active', bg: '#e0f2f1', color: '#00796b' },
  inactive: { label: 'Inactive', bg: '#fff3e0', color: '#ef6c00' },
};

function ProgramStatusTag({ status }) {
  const normalized = String(status ?? '').toLowerCase();
  const style = PROGRAM_STATUS_TAG_STYLES[normalized] ?? {
    label: status ?? '—',
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

export function downloadProgramUpdatesAsCsv(data) {
  const headers = ['Time', 'Notes', 'Program', 'Author', 'Status'];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.updateDate),
    escapeCsvValue(row.note),
    escapeCsvValue(row.name),
    escapeCsvValue([row.firstName, row.lastName].filter(Boolean).join(' ')),
    escapeCsvValue(row.status),
  ]);
  downloadCsv(headers, rows, `program-updates-${getFilenameTimestamp()}.csv`);
}

export const ProgramUpdatesTable = ({ originalData, isLoading, onSave }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const columns = [
    {
      key: 'updateDate',
      type: 'date',
    },
    {
      key: 'note',
      type: 'text',
    },
    {
      key: 'name',
      type: 'text',
    },
    {
      key: 'fullName',
      type: 'text',
    },
    {
      key: 'status',
      type: 'select',
      options: ['Active', 'Inactive'],
    },
  ];
  const [activeFilters, setActiveFilters] = useState([]);
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

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const displayData = useMemo(() => {
    if (searchQuery === '') {
      return filteredData;
    }
    return filteredData.filter(
      (update) =>
        update.updateDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.status.includes(searchQuery.toLowerCase())
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
      <Box mt="30px" ml="10px">
        <Flex gap={10} mb="20px" alignItems="center">
          <Heading>Program Updates</Heading>
          <SearchIcon mt="10px" ml="10px" />
          <Input
            placeholder="Type to search"
            variant="flushed"
            w="200px"
            value={searchQuery}
            onChange={handleSearch}
          />
          <Popover>
            <PopoverTrigger>
              <IconButton
                aria-label="filter"
                icon={<HiOutlineAdjustmentsHorizontal />}
                size="sm"
                variant="ghost"
              />
            </PopoverTrigger>
            <PopoverContent w="800px" maxW="90vw" shadow="xl">
              <FilterComponent
                columns={columns}
                onFilterChange={(filters) => {
                  setActiveFilters(filters);
                }}
              />
            </PopoverContent>
          </Popover>
          <Text fontSize="sm" color="gray.500">
            Displaying {tableData.length} results
          </Text>
          <IconButton
            aria-label="menu"
            icon={<HamburgerIcon />}
            size="sm"
            variant="ghost"
          />
          <IconButton
            aria-label="Download"
            icon={<DownloadIcon />}
            size="sm"
            variant="ghost"
            onClick={() => downloadProgramUpdatesAsCsv(tableData)}
          />
          <Button
            size="sm"
            rightIcon={<AddIcon />}
            onClick={() => {
              openEditForm(null);
            }}
            ml="auto"
          >
            New
          </Button>
        </Flex>

        <Box position="relative">
          {!isLoading && tableData.length === 0 ? (
            <EmptyStateBadge variant="no-updates" />
          ) : (
            <TableContainer overflowX="auto" maxW="100%">
              <Table
                variant="unstyled"
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
                    <Th
                      onClick={() => handleSort('updateDate')}
                      cursor="pointer"
                    >
                      Time{' '}
                      <SortArrows
                        columnKey={'updateDate'}
                        sortOrder={sortOrder}
                      />
                    </Th>
                    <Th onClick={() => handleSort('note')} cursor="pointer">
                      Notes{' '}
                      <SortArrows columnKey={'note'} sortOrder={sortOrder} />
                    </Th>
                    <Th
                      onClick={() => handleSort('programName')}
                      cursor="pointer"
                    >
                      Program{' '}
                      <SortArrows
                        columnKey={'programName'}
                        sortOrder={sortOrder}
                      />
                    </Th>
                    <Th
                      onClick={() => handleSort('firstName')}
                      cursor="pointer"
                    >
                      Author{' '}
                      <SortArrows
                        columnKey={'firstName'}
                        sortOrder={sortOrder}
                      />
                    </Th>
                    <Th onClick={() => handleSort('status')} cursor="pointer">
                      Status{' '}
                      <SortArrows columnKey={'status'} sortOrder={sortOrder} />
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tableData.length === 0 && isLoading ? (
                    <Tr>
                      <Td
                        colSpan={5}
                        borderBottom="1px solid"
                        borderColor="gray.200"
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
                        sx={{
                          '& td': {
                            borderBottom: '1px solid',
                            borderColor: 'gray.200',
                          },
                        }}
                      >
                        <Td>{row.updateDate}</Td>
                        <Td>{row.note}</Td>
                        <Td>{row.name}</Td>
                        <Td>
                          {row.firstName} {row.lastName}
                        </Td>
                        <Td>
                          <ProgramStatusTag status={row.status} />
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
      </Box>
    </>
  );
};
