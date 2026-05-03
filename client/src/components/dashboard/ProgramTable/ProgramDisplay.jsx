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
  Divider,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Table,
  TableContainer,
  Tag,
  TagCloseButton,
  TagLabel,
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
import { useTranslation } from 'react-i18next';
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
  onFilteredDataChange,
}) {
  const { t } = useTranslation();
  const [isCardView, setIsCardView] = useState(false);

  const downloadDataAsCsv = () => {
    const headers = [
      t('programsTable.csvProgram'),
      t('programsTable.csvStatus'),
      t('programsTable.csvLaunchDate'),
      t('programsTable.csvLocation'),
      t('programsTable.csvStudents'),
      t('programsTable.csvInstruments'),
      t('programsTable.csvTotalInstruments'),
      t('programsTable.csvPrimaryLanguage'),
      t('programsTable.csvRegionalDirectors'),
      t('programsTable.csvProgramDirectors'),
      t('programsTable.csvCurriculumLinks'),
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

  // --- Location tag state ---
  const [filterLocationTags, setFilterLocationTags] = useState([]);
  const [filterLocationInput, setFilterLocationInput] = useState('');

  // --- Instruments tag state ---
  const [filterInstrumentTags, setFilterInstrumentTags] = useState([]);
  const [filterInstrumentInput, setFilterInstrumentInput] = useState('');

  const handleLocationKeyDown = (e) => {
    if (e.key === 'Enter' && filterLocationInput.trim()) {
      e.preventDefault();
      setFilterLocationTags((prev) => {
        const trimmed = filterLocationInput.trim();
        return prev.some((t) => t.toLowerCase() === trimmed.toLowerCase())
          ? prev
          : [...prev, trimmed];
      });
      setFilterLocationInput('');
    }
  };

  const handleInstrumentKeyDown = (e) => {
    if (e.key === 'Enter' && filterInstrumentInput.trim()) {
      e.preventDefault();
      setFilterInstrumentTags((prev) => [
        ...prev,
        filterInstrumentInput.trim(),
      ]);
      setFilterInstrumentInput('');
    }
  };

  const removeLocationTag = (index) => {
    setFilterLocationTags((prev) => prev.filter((_, i) => i !== index));
  };

  const removeInstrumentTag = (index) => {
    setFilterInstrumentTags((prev) => prev.filter((_, i) => i !== index));
  };

  const filterBySearchPanel = useMemo(() => {
    if (originalData === null) return null;
    let data = originalData;

    // Status filter
    if (filterStatus) {
      const norm = String(filterStatus).toLowerCase();
      data = data.filter((p) => {
        const s = String(p.status ?? '').toLowerCase();
        if (norm === 'active') return s === 'active' || s === 'launched';
        if (norm === 'inactive') return s === 'inactive' || s === 'developing';
        return s === norm;
      });
    }

    // Location tag OR filter
    if (filterLocationTags.length > 0) {
      data = data.filter((p) =>
        filterLocationTags.some((tag) =>
          (p.location ?? '').toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

    // Instrument tag OR filter
    if (filterInstrumentTags.length > 0) {
      data = data.filter((p) => {
        const list = Array.isArray(p.instrumentsMap) ? p.instrumentsMap : [];
        return filterInstrumentTags.some((tag) =>
          list.some((inst) =>
            (inst.name ?? '').toLowerCase().includes(tag.toLowerCase())
          )
        );
      });
    }

    // Advanced filters
    if (_activeFilters.length > 0) {
      const completeFilters = _activeFilters.filter((f) => f.value !== '');

      data = data.filter((row) => {
        if (completeFilters.length === 0) return true;

        return completeFilters.reduce((acc, filter, index) => {
          const rowValue = row[filter.column];

          const matches = (() => {
            switch (filter.operation) {
              case 'contains':
                return String(rowValue ?? '')
                  .toLowerCase()
                  .includes(String(filter.value).toLowerCase());
              case 'does_not_contain':
                return !String(rowValue ?? '')
                  .toLowerCase()
                  .includes(String(filter.value).toLowerCase());
              case 'equals':
                return (
                  String(rowValue ?? '').toLowerCase() ===
                  String(filter.value).toLowerCase()
                );
              case 'is_not':
                return (
                  String(rowValue ?? '').toLowerCase() !==
                  String(filter.value).toLowerCase()
                );
              case 'gt':
                return Number(rowValue) > Number(filter.value);
              case 'lt':
                return Number(rowValue) < Number(filter.value);
              case 'gte':
                return Number(rowValue) >= Number(filter.value);
              case 'lte':
                return Number(rowValue) <= Number(filter.value);
              case 'before':
                return new Date(rowValue) < new Date(filter.value);
              case 'after':
                return new Date(rowValue) > new Date(filter.value);
              case 'is':
                return (
                  new Date(rowValue).toDateString() ===
                  new Date(filter.value).toDateString()
                );
              case 'contains_item':
                return Array.isArray(rowValue)
                  ? rowValue.some((item) =>
                      String(item?.name ?? item)
                        .toLowerCase()
                        .includes(String(filter.value).toLowerCase())
                    )
                  : false;
              default:
                return true;
            }
          })();

          // First filter always applies; subsequent use AND/OR logic
          if (index === 0) return matches;
          if (filter.logic === 'or') return acc || matches;
          return acc && matches;
        }, true);
      });
    }

    return data;
  }, [
    originalData,
    filterStatus,
    filterLocationTags,
    filterInstrumentTags,
    _activeFilters,
  ]);

  const displayData = useMemo(() => {
    if (filterBySearchPanel === null) return null;
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

  useEffect(() => {
    onFilteredDataChange?.(displayData);
  }, [displayData, onFilteredDataChange]);

  const { sortOrder, handleSort } = useTableSort(displayData, setSortedData);
  const tableData = sortedData ?? displayData ?? [];
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
              {t('programsTable.title')}
            </Box>
            <IconButton
              aria-label={t('common.downloadCsv')}
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
              variant="ghost"
              color={isCardView ? 'gray.600' : 'teal.500'}
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
              color={!isCardView ? 'gray.600' : 'teal.500'}
              size="sm"
              variant="ghost"
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
                        {t('programsTable.programStatus')}
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
                          {t('programsTable.developing')}
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
                          {t('programsTable.launched')}
                        </Box>
                      </HStack>
                    </Box>

                    {/* Location tag input */}
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        mb={2}
                      >
                        {t('common.location')}
                      </Text>
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        px={2}
                        py={1}
                        display="flex"
                        flexWrap="wrap"
                        gap={1}
                        alignItems="center"
                        minH="32px"
                        bg="white"
                        _focusWithin={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                      >
                        {filterLocationTags.map((tag, i) => (
                          <Tag
                            key={i}
                            size="sm"
                            borderRadius="full"
                            colorScheme="blue"
                          >
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton
                              onClick={() => removeLocationTag(i)}
                            />
                          </Tag>
                        ))}
                        <Input
                          variant="unstyled"
                          size="sm"
                          placeholder={
                            filterLocationTags.length === 0
                              ? t('programDisplay.filterByLocation')
                              : ''
                          }
                          value={filterLocationInput}
                          onChange={(e) =>
                            setFilterLocationInput(e.target.value)
                          }
                          onKeyDown={handleLocationKeyDown}
                          flex={1}
                          minW="120px"
                          fontSize="sm"
                        />
                      </Box>
                    </Box>

                    {/* Instruments tag input */}
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        mb={2}
                      >
                        {t('common.instruments')}
                      </Text>
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        px={2}
                        py={1}
                        display="flex"
                        flexWrap="wrap"
                        gap={1}
                        alignItems="center"
                        minH="32px"
                        bg="white"
                        _focusWithin={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                      >
                        {filterInstrumentTags.map((tag, i) => (
                          <Tag
                            key={i}
                            size="sm"
                            borderRadius="full"
                            colorScheme="blue"
                          >
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton
                              onClick={() => removeInstrumentTag(i)}
                            />
                          </Tag>
                        ))}
                        <Input
                          variant="unstyled"
                          size="sm"
                          placeholder={
                            filterInstrumentTags.length === 0
                              ? 'Filter by instrument, press Enter'
                              : ''
                          }
                          value={filterInstrumentInput}
                          onChange={(e) =>
                            setFilterInstrumentInput(e.target.value)
                          }
                          onKeyDown={handleInstrumentKeyDown}
                          flex={1}
                          minW="120px"
                          fontSize="sm"
                        />
                      </Box>
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
              {t('programsTable.displayingResults', {
                count: tableData.length,
              })}
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
              {t('programsTable.newProgram')}
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
                  aria-label={t('programsTable.collapsibleTableAria')}
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
                        {t('programsTable.colProgram')}{' '}
                        <SortArrows
                          columnKey="title"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('status')}
                        cursor="pointer"
                      >
                        {t('programsTable.colStatus')}{' '}
                        <SortArrows
                          columnKey="status"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('launchDate')}
                        cursor="pointer"
                      >
                        {t('programsTable.colLaunchDate')}{' '}
                        <SortArrows
                          columnKey="launchDate"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('location')}
                        cursor="pointer"
                      >
                        {t('programsTable.colLocation')}{' '}
                        <SortArrows
                          columnKey="location"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('students')}
                        cursor="pointer"
                      >
                        {t('programsTable.colStudents')}{' '}
                        <SortArrows
                          columnKey="students"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('instruments')}
                        cursor="pointer"
                      >
                        {t('programsTable.colInstruments')}{' '}
                        <SortArrows
                          columnKey="instruments"
                          sortOrder={sortOrder}
                        />
                      </Th>
                      <Th
                        onClick={() => handleSort('totalInstruments')}
                        cursor="pointer"
                      >
                        {t('programsTable.colTotalInstruments')}{' '}
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
                          <VStack>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton
                                key={i}
                                h={20}
                                mb={2}
                                w="100%"
                              />
                            ))}
                          </VStack>
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
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  h={20}
                  mb={2}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
