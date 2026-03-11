import { useCallback, useEffect, useState, useMemo } from 'react';

import {
  AddIcon,
  DownloadIcon,
  EditIcon,
  HamburgerIcon,
  Search2Icon,
} from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  HStack,
  IconButton,
  Input,
  Link,
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
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineSquares2X2,
} from 'react-icons/hi2';
import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '../../utils/downloadCsv';
import { FilterComponent } from '../common/FilterComponent';
import { SortArrows } from '../tables/SortArrows';
import CardView from './CardView';
import { ProgramForm } from './ProgramForm/index';
import { EmptyStateBadge } from '../badges/EmptyStateBadge';

const getRouteByRole = (role, userId) => {
  const routes = {
    'Super Admin': '/admin/programs',
    Admin: '/admin/programs',
    'Regional Director': `/rdProgramTable/${userId}`,
  };
  return routes[role];
};

function mapAdminRow(row) {
  return {
    id: row.id,
    title: row.title ?? row.name,
    status: row.status,
    launchDate: row.launchDate,
    location: row.countryName ?? '',
    country: row.country,

    students: row.students ?? 0,
    instruments: row.instrumentTypes ?? [],
    totalInstruments: row.instruments ?? 0,
    programDirectors: row.programDirectors,
    regionalDirectors: row.regionalDirectors,
    playlists: row.playlists,
    primaryLanguage: row.primaryLanguage,

    media: row.media,
  };
}

function mapRdRow(row) {
  return {
    id: row.programId,
    title: row.programName,
    status: row.programStatus,
    launchDate: row.programLaunchDate,
    location: row.programLocation ?? row.regionName ?? '',
    countryId: row.countryId,
    regionId: row.regionId,
    students: row.totalStudents ?? 0,
    instruments: row.instrumentTypes ?? [],
    totalInstruments: row.totalInstruments ?? 0,
    programDirectors: row.programDirectors,
    regionalDirectors: row.regionalDirectors,
    playlists: row.playlists,
    primaryLanguage: row.primaryLanguage,

    media: row.media,
  };
}

const MAP_BY_ROLE = {
  'Super Admin': mapAdminRow,
  Admin: mapAdminRow,
  'Regional Director': mapRdRow,
};

const STATUS_TAG_STYLES = {
  active: {
    label: 'Launched',
    bg: '#e0f2f1',
    color: '#00796b',
  },
  inactive: {
    label: 'Developing',
    bg: '#fff3e0',
    color: '#ef6c00',
  },
};

// pool of colors for the instrument type tags
const INSTRUMENT_TAG_PALETTE = [
  { bg: '#C6F6D5', color: '#22543D' },
  { bg: '#BEE3F8', color: '#2C5282' },
  { bg: '#FED7D7', color: '#742A2A' },
  { bg: '#FEECC7', color: '#744210' },
  { bg: '#E9D8FD', color: '#553C9A' },
  { bg: '#FED7E2', color: '#702459' },
  { bg: '#C4F1F9', color: '#086F83' },
  { bg: '#D6F3D5', color: '#276749' },
];

function getInstrumentTagStyle(instrumentName) {
  if (!instrumentName) return INSTRUMENT_TAG_PALETTE[0];
  let hash = 0;
  const str = String(instrumentName).toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % INSTRUMENT_TAG_PALETTE.length;
  return INSTRUMENT_TAG_PALETTE[index];
}

function StatusTag({ status }) {
  const normalized = String(status ?? '').toLowerCase();
  const style = STATUS_TAG_STYLES[normalized] ?? {
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

function ExpandableRow({ p, onEdit }) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <Tr
        onClick={onToggle}
        cursor="pointer"
        sx={{
          '& td': {
            borderBottom: isOpen ? 'none' : '1px solid',
            borderColor: 'gray.200',
          },
        }}
      >
        <Td>{p.title}</Td>
        <Td>
          <StatusTag status={p.status} />
        </Td>
        <Td>{p.launchDate}</Td>
        <Td>{p.location}</Td>
        <Td>{p.students}</Td>
        <Td>
          {Array.isArray(p.instruments) || Array.isArray(p.instrumentTypes) ? (
            <HStack spacing={2} flexWrap="wrap">
              {(Array.isArray(p.instruments)
                ? p.instruments
                : p.instrumentTypes
              ).map((inst, idx) => {
                const style = getInstrumentTagStyle(inst.name);
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
                    {inst.name} {inst.quantity}
                  </Box>
                );
              })}
            </HStack>
          ) : (
            (p.instruments ?? '-')
          )}
        </Td>
        <Td>{p.totalInstruments}</Td>
      </Tr>
      <Tr>
        <Td
          colSpan={7}
          borderBottom={isOpen ? '1px solid' : 'none'}
          borderColor="gray.200"
          p={isOpen ? undefined : 0}
        >
          <Collapse in={isOpen}>
            <Box position="relative">
              <HStack align="start">
                <Box flex="1" display="grid">
                  <Box fontSize="sm" fontWeight="semibold" pb="2">
                    Language:
                  </Box>
                  <Box>{p.primaryLanguage ?? '-'}</Box>
                </Box>
                <Box flex="1" display="grid">
                  <Box fontSize="sm" fontWeight="semibold" pb="2">
                    Regional Director(s)
                  </Box>
                  <Box>
                    <VStack align="start" spacing={2}>
                      {Array.isArray(p.regionalDirectors)
                        ? p.regionalDirectors.map((d, idx) => (
                            <Box
                              key={
                                d.userId ??
                                `${d.firstName}-${d.lastName}-${idx}`
                              }
                              bg="gray.200"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {d.firstName} {d.lastName}
                            </Box>
                          ))
                        : null}
                    </VStack>
                  </Box>
                </Box>
                <Box flex="1" display="grid">
                  <Box fontSize="sm" fontWeight="semibold" pb="2">
                    Program Director(s)
                  </Box>
                  <Box>
                    <VStack align="start" spacing={2}>
                      {Array.isArray(p.programDirectors)
                        ? p.programDirectors.map((d, idx) => (
                            <Box
                              key={
                                d.userId ??
                                `${d.firstName}-${d.lastName}-${idx}`
                              }
                              bg="gray.200"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {d.firstName} {d.lastName}
                            </Box>
                          ))
                        : null}
                    </VStack>
                  </Box>
                </Box>
                <Box flex="1" display="grid">
                  <Box fontSize="sm" fontWeight="semibold" pb="2">
                    Curriculum Link(s)
                  </Box>
                  <Box>
                    {Array.isArray(p.playlists)
                      ? p.playlists.map((l) => (
                          <Box key={l.link}>
                            <Link
                              href={l.link}
                              color="blue"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {l.name}
                            </Link>
                          </Box>
                        ))
                      : null}
                  </Box>
                </Box>
              </HStack>
              <Button
                size="xs"
                position="absolute"
                bottom="8px"
                right="8px"
                border="1px solid"
                bg="white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(p);
                }}
                leftIcon={<EditIcon />}
              >
                Update
              </Button>
            </Box>
          </Collapse>
        </Td>
      </Tr>
    </>
  );
}

function ProgramDisplay({
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
  console.log('originalData', originalData);
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
        escapeCsvValue(p.launchDate),
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

  const [activeFilters, setActiveFilters] = useState([]);

  const filteredData = useMemo(
    () => applyFilters(activeFilters, originalData ?? []),
    [activeFilters, originalData]
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const displayData = useMemo(() => {
    if (!searchQuery) return filteredData;
    const query = searchQuery.toLowerCase();
    return filteredData.filter(
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
  }, [searchQuery, filteredData]);

  const [sortedData, setSortedData] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayData]);

  const { sortOrder, handleSort } = useTableSort(displayData, setSortedData);
  const tableData = sortedData ?? displayData;

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
      <TableContainer w="80vw">
        <HStack mb={4} justifyContent="space-between" w="100%">
          <HStack spacing={4}>
            <Box fontSize="xl" fontWeight="semibold">
              All Programs
            </Box>
            <HStack spacing={1}>
              <IconButton
                aria-label="search"
                icon={<Search2Icon />}
                size="sm"
                variant="ghost"
              />
              <Input
                w="120px"
                size="xs"
                placeholder="Type to search"
                variant="unstyled"
                borderBottom="1px solid"
                borderColor="gray.300"
                borderRadius="0"
                px={1}
                value={searchQuery}
                onChange={handleSearch}
              />
            </HStack>
          </HStack>
          <HStack spacing={1}>
            <IconButton
              aria-label="menu"
              icon={<HamburgerIcon />}
              size="sm"
              variant="ghost"
              onClick={() => setIsCardView(false)}
            />
            <Divider orientation="vertical" h="20px" />
            <IconButton
              aria-label="search"
              icon={<HiOutlineSquares2X2 />}
              size="sm"
              variant="ghost"
              onClick={() => setIsCardView(true)}
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
                  onFilterChange={(filters) => setActiveFilters(filters)}
                />
              </PopoverContent>
            </Popover>
            <Text fontSize="sm" color="gray.500">
              Displaying {tableData.length} results
            </Text>
            <IconButton
              aria-label="download"
              icon={<DownloadIcon />}
              size="sm"
              variant="ghost"
              ml={2}
              onClick={downloadDataAsCsv}
            />
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              backgroundColor="teal.500"
              color="white"
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
                        borderBottom: '1px solid',
                        borderColor: 'gray.200',
                        color: 'gray.700',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: 'xs',
                      },
                    }}
                  >
                    <Th onClick={() => handleSort('title')} cursor="pointer">
                      Program{' '}
                      <SortArrows columnKey="title" sortOrder={sortOrder} />
                    </Th>
                    <Th onClick={() => handleSort('status')} cursor="pointer">
                      Status{' '}
                      <SortArrows columnKey="status" sortOrder={sortOrder} />
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
                    <Th onClick={() => handleSort('location')} cursor="pointer">
                      Location{' '}
                      <SortArrows columnKey="location" sortOrder={sortOrder} />
                    </Th>
                    <Th onClick={() => handleSort('students')} cursor="pointer">
                      Students{' '}
                      <SortArrows columnKey="students" sortOrder={sortOrder} />
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
                      <ExpandableRow key={p.id} p={p} onEdit={openEditForm} />
                    ))
                  )}
                </Tbody>
              </Table>
            )
          ) : tableData.length === 0 && !isLoading ? (
            <EmptyStateBadge variant="no-programs" />
          ) : (
            <CardView data={tableData} openEditForm={openEditForm} />
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
      </TableContainer>
    </>
  );
}

function ProgramTable({ onStatsRefresh }) {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role, loading: roleLoading } = useRoleContext();

  const { backend } = useBackendContext();
  const [originalPrograms, setOriginalPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openEditForm = (program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  const fetchData = useCallback(async () => {
    if (roleLoading) return;

    const route = getRouteByRole(role, userId);
    const mapRow = MAP_BY_ROLE[role];

    if (!route || !mapRow) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await backend.get(route);
      const rows = Array.isArray(res.data) ? res.data : [];
      console.log('rows', rows);
      const programDetails = await Promise.all(
        rows.map(async (row) => {
          // TODO: make this more efficient with lazy loading
          const programId = row.id ?? row.programId;
          const [
            instrumentTypes,
            playlists,
            programDirectors,
            regionalDirectors,
            media,
          ] = await Promise.all([
            backend.get(`/program/${programId}/instruments`),
            backend.get(`/program/${programId}/playlists`),
            backend
              .get(`/program/${programId}/program-directors`)
              .catch(() => ({ data: [] })),
            backend
              .get(`/program/${programId}/regional-directors`)
              .catch(() => ({ data: [] })),
            backend
              .get(`/program/${programId}/media`)
              .catch(() => ({ data: [] })),
          ]);

          return {
            ...row,
            instrumentTypes: instrumentTypes?.data || [],
            playlists: playlists.data,
            programDirectors: programDirectors?.data || [],
            regionalDirectors: regionalDirectors?.data || [],
            media: media?.data || [],
          };
        })
      );
      console.log('programDetails', programDetails);
      const mappedPrograms = programDetails.map(mapRow);
      console.log('mappedPrograms', mappedPrograms);
      setOriginalPrograms(mappedPrograms);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [role, roleLoading, userId, backend]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!getRouteByRole(role, userId) && !roleLoading) {
    return null;
  }

  return (
    <ProgramDisplay
      originalData={originalPrograms}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isLoading={isLoading}
      role={role}
      userId={userId}
      openEditForm={openEditForm}
      isFormOpen={isFormOpen}
      setIsFormOpen={setIsFormOpen}
      selectedProgram={selectedProgram}
      setSelectedProgram={setSelectedProgram}
      onSave={fetchData}
      onStatsRefresh={onStatsRefresh}
    />
  );
}

export default ProgramTable;
