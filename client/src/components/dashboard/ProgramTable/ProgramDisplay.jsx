import { useEffect, useMemo, useState } from 'react';

import {
  AddIcon,
  DownloadIcon,
  HamburgerIcon,
  Search2Icon,
} from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Divider,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
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
  VStack,
} from '@chakra-ui/react';

import { EmptyStateBadge } from '@/components/badges/EmptyStateBadge';
import { FilterComponent } from '@/components/common/FilterComponent';
import CardView from '@/components/dashboard/CardView';
import { ProgramForm } from '@/components/dashboard/ProgramForm/index';
import { SortArrows } from '@/components/tables/SortArrows';
import { useTableSort } from '@/contexts/hooks/TableSort';
import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineSquares2X2,
} from 'react-icons/hi2';

import { ExpandableProgramRow } from './ExpandableProgramRow';
import { formatLaunchDate, getRouteByRole } from './programTableMappers';
import { STATUS_TAG_STYLES } from './programTableTagConstants';

export function ProgramDisplay({
  originalData,
  searchQuery,
  setSearchQuery,
  isLoading,
  role,
  userId,
  openEditForm,
  isFormOpen,
  setIsFormOpen,
  selectedProgram,
  setSelectedProgram,
  onSave,
  onStatsRefresh,
}) {
  const [isCardView, setIsCardView] = useState(false);

  const downloadDataAsCsv = () => {
    const headers = [
      'Program',
      'Status',
      'Launch Date',
      'Location',
      'Students',
      'Instruments',
      'Total Instruments',
      'Primary Language',
      'Regional Directors',
      'Program Directors',
      'Curriculum Links',
    ];
    const rows = (tableData || []).map((p) => {
      const instrumentsArray =
        (Array.isArray(p.instruments) && p.instruments) ||
        (Array.isArray(p.instrumentTypes) && p.instrumentTypes) ||
        null;

      const instrumentsFormatted = instrumentsArray
        ? instrumentsArray
            .map((inst) => `${inst.name ?? ''}: ${inst.quantity ?? 0}`)
            .join('; ')
        : p.instruments;

      return [
        escapeCsvValue(p.title),
        escapeCsvValue(p.status),
        escapeCsvValue(formatLaunchDate(p.launchDate)),
        escapeCsvValue(p.location),
        escapeCsvValue(p.students),
        escapeCsvValue(instrumentsFormatted),
        escapeCsvValue(p.totalInstruments),
        escapeCsvValue(p.primaryLanguage),
        escapeCsvValue(
          Array.isArray(p.regionalDirectors)
            ? p.regionalDirectors
                .map((d) => `${d.firstName} ${d.lastName}`)
                .join('; ')
            : ''
        ),
        escapeCsvValue(
          Array.isArray(p.programDirectors)
            ? p.programDirectors
                .map((d) => `${d.firstName} ${d.lastName}`)
                .join('; ')
            : ''
        ),
        escapeCsvValue(
          Array.isArray(p.playlists)
            ? p.playlists.map((l) => l.link ?? l.name).join('; ')
            : ''
        ),
      ];
    });
    downloadCsv(headers, rows, `programs-${getFilenameTimestamp()}.csv`);
  };

  const columns = [
    { key: 'title', type: 'text' },
    { key: 'status', type: 'select', options: ['Active', 'Inactive'] },
    { key: 'launchDate', type: 'date' },
    { key: 'location', type: 'text' },
    { key: 'students', type: 'number' },
    { key: 'instruments', type: 'number' },
    { key: 'totalInstruments', type: 'number' },
  ];
  const [_activeFilters, setActiveFilters] = useState([]);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterInstruments, setFilterInstruments] = useState('');

  const filterBySearchPanel = useMemo(() => {
    let data = originalData ?? [];
    if (filterStatus) {
      const norm = String(filterStatus).toLowerCase();
      data = data.filter((p) => {
        const s = String(p.status ?? '').toLowerCase();
        if (norm === 'active') return s === 'active' || s === 'launched';
        if (norm === 'inactive') return s === 'inactive' || s === 'developing';
        return s === norm;
      });
    }
    if (filterLocation.trim()) {
      const q = filterLocation.trim().toLowerCase();
      data = data.filter((p) => (p.location ?? '').toLowerCase().includes(q));
    }
    if (filterInstruments.trim()) {
      const q = filterInstruments.trim().toLowerCase();
      data = data.filter((p) => {
        const list = Array.isArray(p.instruments) ? p.instruments : [];
        if (!Array.isArray(list)) return false;
        return list.some((inst) => (inst.name ?? '').toLowerCase().includes(q));
      });
    }
    return data;
  }, [originalData, filterStatus, filterLocation, filterInstruments]);

  const displayData = useMemo(() => {
    if (!searchQuery) return filterBySearchPanel;
    const query = searchQuery.toLowerCase();
    return filterBySearchPanel.filter(
      (program) =>
        program.title?.toLowerCase().includes(query) ||
        program.status?.toLowerCase().includes(query) ||
        program.launchDate?.toLowerCase().includes(query) ||
        program.location?.toLowerCase().includes(query) ||
        String(program.students).includes(query) ||
        (Array.isArray(program.instruments)
          ? program.instruments.some((inst) =>
              `${inst.name ?? ''} ${inst.quantity ?? ''}`
                .toLowerCase()
                .includes(query)
            )
          : String(program.instruments).includes(query)) ||
        String(program.totalInstruments).includes(query)
    );
  }, [searchQuery, filterBySearchPanel]);

  const [sortedData, setSortedData] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayData]);

  const { sortOrder, handleSort } = useTableSort(displayData, setSortedData);
  const tableData = sortedData ?? displayData;
  const [flippedId, setFlippedId] = useState(null);

  if (!getRouteByRole(role, userId)) return null;

  return (
    <>
      <ProgramForm
        isOpen={isFormOpen}
        onOpen={() => setIsFormOpen(true)}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProgram(null);
        }}
        program={selectedProgram}
        onSave={() => {
          onSave?.();
          onStatsRefresh?.();
        }}
      />
      <Box
        w="75vw"
        maxW="100%"
      >
        <HStack
          mb={4}
          justifyContent="space-between"
          w="100%"
        >
          <HStack spacing={3}>
            <Box
              fontSize="3xl"
              fontWeight="semibold"
            >
              Programs
            </Box>
            <IconButton
              aria-label="download CSV"
              icon={<DownloadIcon />}
              size="sm"
              variant="ghost"
              onClick={downloadDataAsCsv}
            />
          </HStack>
          <HStack spacing={2}>
            <InputGroup
              size="sm"
              maxW="200px"
            >
              <InputLeftElement pointerEvents="none">
                <Search2Icon
                  color="gray.400"
                  boxSize={4}
                />
              </InputLeftElement>
              <Input
                pl={8}
                placeholder="Search programs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                borderColor="gray.200"
              />
            </InputGroup>

            <IconButton
              aria-label="table view"
              icon={<HamburgerIcon />}
              size="sm"
              variant={isCardView ? 'ghost' : 'solid'}
              onClick={() => setIsCardView(false)}
            />
            <Divider
              orientation="vertical"
              h="20px"
              borderWidth="1px"
            />
            <IconButton
              aria-label="card view"
              icon={<HiOutlineSquares2X2 />}
              size="sm"
              variant={isCardView ? 'ghost' : 'solid'}
              onClick={() => setIsCardView(true)}
            />

            <Popover placement="bottom-end">
              <PopoverTrigger>
                <IconButton
                  aria-label="Filters"
                  icon={<HiOutlineAdjustmentsHorizontal />}
                  size="sm"
                  variant="ghost"
                />
              </PopoverTrigger>
              <PopoverContent
                w={_activeFilters.length > 0 ? '800px' : '400px'}
                maxW="90vw"
                shadow="xl"
              >
                <Box p={4}>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    mb={4}
                  >
                    Quick filters
                  </Text>
                  <VStack
                    align="stretch"
                    spacing={4}
                    mb={6}
                  >
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        mb={2}
                      >
                        Program Status
                      </Text>
                      <HStack spacing={2}>
                        <Box
                          as="button"
                          type="button"
                          px={3}
                          py={1.5}
                          borderRadius="md"
                          fontSize="sm"
                          fontWeight="medium"
                          bg={
                            filterStatus === 'inactive'
                              ? STATUS_TAG_STYLES.inactive.bg
                              : 'gray.100'
                          }
                          color={
                            filterStatus === 'inactive'
                              ? STATUS_TAG_STYLES.inactive.color
                              : 'gray.600'
                          }
                          onClick={() =>
                            setFilterStatus((s) =>
                              s === 'inactive' ? '' : 'inactive'
                            )
                          }
                        >
                          Developing
                        </Box>
                        <Box
                          as="button"
                          type="button"
                          px={3}
                          py={1.5}
                          borderRadius="md"
                          fontSize="sm"
                          fontWeight="medium"
                          bg={
                            filterStatus === 'active'
                              ? STATUS_TAG_STYLES.active.bg
                              : 'gray.100'
                          }
                          color={
                            filterStatus === 'active'
                              ? STATUS_TAG_STYLES.active.color
                              : 'gray.600'
                          }
                          onClick={() =>
                            setFilterStatus((s) =>
                              s === 'active' ? '' : 'active'
                            )
                          }
                        >
                          Launched
                        </Box>
                      </HStack>
                    </Box>
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        mb={2}
                      >
                        Location
                      </Text>
                      <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                          <Search2Icon
                            color="gray.400"
                            boxSize={4}
                          />
                        </InputLeftElement>
                        <Input
                          pl={8}
                          placeholder="Filter by location"
                          value={filterLocation}
                          onChange={(e) => setFilterLocation(e.target.value)}
                        />
                      </InputGroup>
                    </Box>
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        mb={2}
                      >
                        Instruments
                      </Text>
                      <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                          <Search2Icon
                            color="gray.400"
                            boxSize={4}
                          />
                        </InputLeftElement>
                        <Input
                          pl={8}
                          placeholder="Filter by instrument"
                          value={filterInstruments}
                          onChange={(e) => setFilterInstruments(e.target.value)}
                        />
                      </InputGroup>
                    </Box>
                  </VStack>
                  <Divider mb={4} />
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    mb={4}
                  >
                    Advanced filters
                  </Text>
                  <FilterComponent
                    columns={columns}
                    onFilterChange={(filters) => setActiveFilters(filters)}
                  />
                </Box>
              </PopoverContent>
            </Popover>
            <Text
              fontSize="sm"
              color="gray.500"
            >
              Displaying {tableData.length} results
            </Text>
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              backgroundColor="teal.500"
              color="white"
              _hover={{
                backgroundColor: 'teal.600',
              }}
              onClick={() => {
                setSelectedProgram(null);
                setIsFormOpen(true);
              }}
            >
              New Program
            </Button>
          </HStack>
        </HStack>

        <Box position="relative">
          {!isCardView ? (
            !isLoading && tableData.length === 0 ? (
              <EmptyStateBadge variant="no-programs" />
            ) : (
              <TableContainer
                overflowX="auto"
                w="100%"
              >
                <Table
                  variant="unstyled"
                  aria-label="collapsible-table"
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
                          borderBottom: '2px solid',
                          borderColor: 'gray.300',
                          color: 'gray.700',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          fontSize: 'xs',
                        },
                      }}
                    >
                      <Th
                        onClick={() => handleSort('title')}
                        cursor="pointer"
                      >
                        Program{' '}
                        <SortArrows
                          columnKey="title"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('status')}
                        cursor="pointer"
                      >
                        Status{' '}
                        <SortArrows
                          columnKey="status"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('launchDate')}
                        cursor="pointer"
                      >
                        Launch Date{' '}
                        <SortArrows
                          columnKey="launchDate"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('location')}
                        cursor="pointer"
                      >
                        Location{' '}
                        <SortArrows
                          columnKey="location"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('students')}
                        cursor="pointer"
                      >
                        Students{' '}
                        <SortArrows
                          columnKey="students"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('instruments')}
                        cursor="pointer"
                      >
                        Instruments{' '}
                        <SortArrows
                          columnKey="instruments"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('totalInstruments')}
                        cursor="pointer"
                      >
                        Total Instruments{' '}
                        <SortArrows
                          columnKey="totalInstruments"
                          sortOrder={sortOrder}
                        />
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {tableData.length === 0 && isLoading ? (
                      <Tr>
                        <Td
                          colSpan={7}
                          borderBottom="1px solid"
                          borderColor="gray.200"
                        >
                          <Center py={8}>
                            <Spinner size="lg" />
                          </Center>
                        </Td>
                      </Tr>
                    ) : (
                      tableData.map((p) => (
                        <ExpandableProgramRow
                          key={p.id}
                          p={p}
                          onEdit={openEditForm}
                        />
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            )
          ) : tableData.length === 0 && !isLoading ? (
            <EmptyStateBadge variant="no-programs" />
          ) : (
            <CardView
              data={tableData}
              flippedId={flippedId}
              setFlippedId={setFlippedId}
              openEditForm={openEditForm}
            />
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
}
