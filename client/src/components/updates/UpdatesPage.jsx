import { useCallback, useEffect, useMemo, useState } from 'react';

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
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  TableContainer,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, AddIcon } from '@chakra-ui/icons';
import { FiBell, FiDownload, FiSearch, FiList } from 'react-icons/fi';
import {
  HiOutlineAdjustmentsHorizontal,
  HiArrowsUpDown,
} from 'react-icons/hi2';
import { BsGrid3X3Gap } from 'react-icons/bs';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';

import {
  ProgramUpdatesTable,
  downloadProgramUpdatesAsCsv,
} from './ProgramUpdatesTable';
import {
  MediaUpdatesTable,
  downloadMediaUpdatesAsCsv,
} from './MediaUpdatesTable';
import { AccountUpdatesTable } from './AccountUpdatesTable';
import { CreateUpdateDrawer } from './CreateUpdateDrawer';
import { FilterComponent } from '../common/FilterComponent';
import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { SortArrows } from '../tables/SortArrows';

const EmptyState = () => (
  <Center py={20}>
    <VStack spacing={4}>
      <Box
        bg="gray.100"
        borderRadius="full"
        w="200px"
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={FiBell} boxSize="80px" color="gray.300" />
      </Box>
      <Text color="gray.400" fontSize="lg" textAlign="center">
        No updates have{'\n'}been made yet.
      </Text>
    </VStack>
  </Center>
);

const PDStatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  let bg = 'gray.100';
  let color = 'gray.700';
  if (s === 'pending' || s === 'unresolved') {
    bg = 'red.100';
    color = 'red.600';
  } else if (s === 'reviewed' || s === 'resolved') {
    bg = 'green.100';
    color = 'green.600';
  } else if (s === 'approved' || s === 'active') {
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

const pdColumns = [
  { key: 'updateDate', type: 'date' },
  { key: 'instrumentName', type: 'text' },
  {
    key: 'status',
    type: 'select',
    options: ['Pending', 'Reviewed', 'Approved', 'Resolved'],
  },
  { key: 'note', type: 'text' },
];

const ProgramDirectorView = ({ data, isLoading, onSave }) => {
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

        <InputGroup maxW="200px">
          <InputLeftElement pointerEvents="none" h="32px">
            <Icon as={FiSearch} color="gray.400" boxSize="14px" />
          </InputLeftElement>
          <Input
            placeholder="Search"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="4px"
            h="32px"
            fontSize="sm"
            _focus={{ borderColor: 'gray.400' }}
            _placeholder={{ color: 'gray.400' }}
            pl={8}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <Popover>
          <PopoverTrigger>
            <IconButton
              aria-label="Filter"
              icon={<HiOutlineAdjustmentsHorizontal />}
              variant="ghost"
              color="gray.500"
              size="sm"
            />
          </PopoverTrigger>
          <PopoverContent w="800px" maxW="90vw" shadow="xl">
            <FilterComponent
              columns={pdColumns}
              onFilterChange={(filters) => setActiveFilters(filters)}
            />
          </PopoverContent>
        </Popover>

        <IconButton
          aria-label="Sort"
          icon={<HiArrowsUpDown />}
          variant="ghost"
          color="gray.500"
          size="sm"
        />

        <HStack
          spacing={0}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
        >
          <IconButton
            aria-label="List view"
            icon={<FiList />}
            variant="ghost"
            size="sm"
            color="gray.500"
            borderRadius="md"
          />
          <IconButton
            aria-label="Grid view"
            icon={<BsGrid3X3Gap />}
            variant="ghost"
            size="sm"
            color="gray.500"
            borderRadius="md"
          />
        </HStack>

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
            <EmptyState />
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

const programSectionColumns = [
  { key: 'note', type: 'text' },
  { key: 'status', type: 'select', options: ['Resolved', 'Unresolved'] },
  { key: 'name', type: 'text' },
  { key: 'updateDate', type: 'date' },
];

const mediaSectionColumns = [
  { key: 'note', type: 'text' },
  {
    key: 'status',
    type: 'select',
    options: ['Approved', 'Resolved', 'Unresolved'],
  },
  { key: 'programName', type: 'text' },
  { key: 'updateDate', type: 'date' },
];

const UpdatesSection = ({
  title,
  data,
  originalData,
  isLoading,
  onSave,
  setData,
  isMedia = false,
  globalSearchQuery = '',
  showStatus = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sectionSearch, setSectionSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  // Combine global + section search
  const effectiveSearch = sectionSearch || globalSearchQuery;

  const sectionColumns = isMedia ? mediaSectionColumns : programSectionColumns;

  return (
    <Box mb={6}>
      <Flex align="center" gap={3} mb={3} wrap="wrap">
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
          <Heading as="h2" size="md" fontWeight="600">
            {title}
          </Heading>
        </HStack>
        <IconButton
          icon={<FiDownload />}
          variant="ghost"
          size="sm"
          aria-label={`Download ${title}`}
          color="gray.500"
          onClick={() => {
            if (isMedia) {
              downloadMediaUpdatesAsCsv(data);
            } else {
              downloadProgramUpdatesAsCsv(data);
            }
          }}
        />
        <InputGroup maxW="200px">
          <InputLeftElement pointerEvents="none" h="32px">
            <Icon as={FiSearch} color="gray.400" boxSize="14px" />
          </InputLeftElement>
          <Input
            placeholder="Search"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="4px"
            h="32px"
            fontSize="sm"
            _focus={{ borderColor: 'gray.400' }}
            _placeholder={{ color: 'gray.400' }}
            pl={8}
            value={sectionSearch}
            onChange={(e) => setSectionSearch(e.target.value)}
          />
        </InputGroup>
        <Popover>
          <PopoverTrigger>
            <IconButton
              aria-label="Filter"
              icon={<HiOutlineAdjustmentsHorizontal />}
              variant="ghost"
              color="gray.500"
              size="sm"
            />
          </PopoverTrigger>
          <PopoverContent w="800px" maxW="90vw" shadow="xl">
            <FilterComponent
              columns={sectionColumns}
              onFilterChange={(filters) => setActiveFilters(filters)}
            />
          </PopoverContent>
        </Popover>
        <IconButton
          aria-label="Sort"
          icon={<HiArrowsUpDown />}
          variant="ghost"
          color="gray.500"
          size="sm"
        />
        <HStack
          spacing={0}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
        >
          <IconButton
            aria-label="List view"
            icon={<FiList />}
            variant="ghost"
            size="sm"
            color="gray.500"
            borderRadius="md"
          />
          <IconButton
            aria-label="Grid view"
            icon={<BsGrid3X3Gap />}
            variant="ghost"
            size="sm"
            color="gray.500"
            borderRadius="md"
          />
        </HStack>
      </Flex>

      {!isCollapsed && (
        <Box bg="white" borderRadius="xl" overflow="hidden">
          {isMedia ? (
            <MediaUpdatesTable
              data={data}
              setData={setData}
              originalData={originalData}
              isLoading={isLoading}
              searchQuery={effectiveSearch}
              activeFilters={activeFilters}
              embedded
            />
          ) : (
            <ProgramUpdatesTable
              originalData={originalData}
              isLoading={isLoading}
              onSave={onSave}
              searchQuery={effectiveSearch}
              activeFilters={activeFilters}
              embedded
              showStatus={showStatus}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export const UpdatesPage = () => {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role } = useRoleContext();
  const { backend } = useBackendContext();

  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [originalProgramUpdatesData, setOriginalProgramUpdatesData] = useState(
    []
  );
  const [mediaUpdatesData, setMediaUpdatesData] = useState([]);
  const [originalMediaUpdatesData, setOriginalMediaUpdatesData] = useState([]);
  const [accountUpdatesData, setAccountUpdatesData] = useState([]);
  const [originalAccountUpdatesData, setOriginalAccountUpdatesData] = useState(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isProgramUpdatesLoading, setIsProgramUpdatesLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const fetchData = useCallback(
    async (path) => {
      try {
        const response = await backend.get(`/update-permissions/${path}`);
        return response.data;
      } catch (error) {
        console.error(
          'Request failed:',
          path,
          error.response?.status,
          error.message
        );
        return [];
      }
    },
    [backend]
  );

  const fetchMediaUpdatesForUser = useCallback(async () => {
    try {
      const response = await backend.get(
        `/mediaChange/${userId}/media-updates`
      );
      return response.data ?? [];
    } catch (error) {
      console.error(
        'Request failed: mediaChange/:userId/media-updates',
        error.response?.status,
        error.message
      );
      return [];
    }
  }, [backend, userId]);

  const refetchProgramUpdates = useCallback(async () => {
    setIsProgramUpdatesLoading(true);
    try {
      const programUpdates = await fetchData(`program-updates/${userId}`);
      const mappedProgram = (programUpdates || []).map((item) => ({
        ...item,
        fullName: `${item.firstName} ${item.lastName}`,
      }));
      setProgramUpdatesData(mappedProgram);
      setOriginalProgramUpdatesData(mappedProgram);
    } catch (error) {
      console.error('Error refetching program updates:', error);
    } finally {
      setIsProgramUpdatesLoading(false);
    }
  }, [fetchData, userId]);

  useEffect(() => {
    if (!userId || !backend) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (role === 'Program Director') {
          const programUpdates = await fetchData(`program-updates/${userId}`);
          const mappedProgram = (programUpdates || []).map((item) => ({
            ...item,
            fullName: `${item.firstName} ${item.lastName}`,
          }));
          setProgramUpdatesData(mappedProgram);
          setOriginalProgramUpdatesData(mappedProgram);
        } else {
          const [mediaUpdates, programUpdates] = await Promise.all([
            fetchMediaUpdatesForUser(),
            fetchData(`program-updates/${userId}`),
          ]);
          const mappedMedia = (mediaUpdates || []).map((item) => ({
            ...item,
            fullName: `${item.firstName} ${item.lastName}`,
          }));
          const mappedProgram = (programUpdates || []).map((item) => ({
            ...item,
            fullName: `${item.firstName} ${item.lastName}`,
          }));
          setOriginalMediaUpdatesData(mappedMedia);
          setMediaUpdatesData(mappedMedia);
          setProgramUpdatesData(mappedProgram);
          setOriginalProgramUpdatesData(mappedProgram);

          // Account updates placeholder — no backend route yet
          setAccountUpdatesData([]);
          setOriginalAccountUpdatesData([]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, backend, fetchData, fetchMediaUpdatesForUser, role]);

  const handleDownload = () => {
    if (tabIndex === 0) {
      downloadProgramUpdatesAsCsv(programUpdatesData);
    } else if (tabIndex === 1) {
      downloadMediaUpdatesAsCsv(mediaUpdatesData);
    }
  };

  // Split program updates into flagged (special requests) and non-flagged (other)
  const specialRequestsData = useMemo(
    () => programUpdatesData.filter((item) => item.flagged),
    [programUpdatesData]
  );
  const otherUpdatesData = useMemo(
    () => programUpdatesData.filter((item) => !item.flagged),
    [programUpdatesData]
  );
  const originalSpecialRequests = useMemo(
    () => originalProgramUpdatesData.filter((item) => item.flagged),
    [originalProgramUpdatesData]
  );
  const originalOtherUpdates = useMemo(
    () => originalProgramUpdatesData.filter((item) => !item.flagged),
    [originalProgramUpdatesData]
  );

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="gray.500" />
      </Center>
    );
  }

  const isAdmin = role === 'Admin' || role === 'Super Admin';
  const isRD = role === 'Regional Director';
  const showTabs = isAdmin || isRD;

  if (!showTabs) {
    // Program Director view
    return (
      <ProgramDirectorView
        data={programUpdatesData}
        isLoading={isLoading || isProgramUpdatesLoading}
        onSave={refetchProgramUpdates}
      />
    );
  }

  // Admin view: flat tables per tab, no section splits, FLAG+TYPE columns on Program tab
  if (isAdmin) {
    return (
      <Box p={8} bg="gray.50" minH="100vh" mx={-4} mt={0}>
        <Flex align="center" gap={4} mb={4} wrap="wrap">
          <Heading as="h1" size="lg" fontWeight="500">
            Updates
          </Heading>
          <IconButton
            icon={<FiDownload />}
            variant="ghost"
            size="sm"
            aria-label="Download updates"
            color="gray.500"
            onClick={handleDownload}
          />
        </Flex>

        <Tabs index={tabIndex} onChange={setTabIndex} variant="unstyled">
          <TabList>
            <Tab
              _selected={{
                color: 'black',
                borderBottom: '2px solid',
                borderColor: 'teal.400',
              }}
              color="gray.500"
              fontWeight="500"
              pb={2}
              px={0}
              mr={6}
            >
              Program
              <Badge
                ml={2}
                bg="gray.200"
                color="gray.600"
                borderRadius="full"
                fontSize="xs"
                px={2}
              >
                {programUpdatesData.length}
              </Badge>
            </Tab>
            <Tab
              _selected={{
                color: 'black',
                borderBottom: '2px solid',
                borderColor: 'teal.400',
              }}
              color="gray.500"
              fontWeight="500"
              pb={2}
              px={0}
              mr={6}
            >
              Media
              <Badge
                ml={2}
                bg="gray.200"
                color="gray.600"
                borderRadius="full"
                fontSize="xs"
                px={2}
              >
                {mediaUpdatesData.length}
              </Badge>
            </Tab>
            <Tab
              _selected={{
                color: 'black',
                borderBottom: '2px solid',
                borderColor: 'teal.400',
              }}
              color="gray.500"
              fontWeight="500"
              pb={2}
              px={0}
              mr={6}
            >
              Account
              <Badge
                ml={2}
                bg="gray.200"
                color="gray.600"
                borderRadius="full"
                fontSize="xs"
                px={2}
              >
                {accountUpdatesData.length}
              </Badge>
            </Tab>
          </TabList>

          <Flex align="center" gap={3} mt={4} mb={4} wrap="wrap">
            <InputGroup maxW="200px">
              <InputLeftElement pointerEvents="none" h="32px">
                <Icon as={FiSearch} color="gray.400" boxSize="14px" />
              </InputLeftElement>
              <Input
                placeholder="Search"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="4px"
                h="32px"
                fontSize="sm"
                _focus={{ borderColor: 'gray.400' }}
                _placeholder={{ color: 'gray.400' }}
                pl={8}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Popover>
              <PopoverTrigger>
                <IconButton
                  aria-label="Filter"
                  icon={<HiOutlineAdjustmentsHorizontal />}
                  variant="ghost"
                  color="gray.500"
                  size="sm"
                />
              </PopoverTrigger>
              <PopoverContent w="800px" maxW="90vw" shadow="xl">
                <FilterComponent
                  columns={programSectionColumns}
                  onFilterChange={(filters) => {}}
                />
              </PopoverContent>
            </Popover>
            <IconButton
              aria-label="Sort"
              icon={<HiArrowsUpDown />}
              variant="ghost"
              color="gray.500"
              size="sm"
            />
          </Flex>

          <TabPanels>
            {/* Program Tab - Admin: flat table with FLAG + TYPE columns */}
            <TabPanel p={0} pt={4}>
              {programUpdatesData.length === 0 ? (
                <EmptyState />
              ) : (
                <Box bg="white" borderRadius="xl" overflow="hidden">
                  <ProgramUpdatesTable
                    originalData={programUpdatesData}
                    isLoading={isProgramUpdatesLoading}
                    onSave={refetchProgramUpdates}
                    searchQuery={searchQuery}
                    showStatus
                    showFlagAndType
                    embedded
                  />
                </Box>
              )}
            </TabPanel>
            {/* Media Tab - Admin: flat table */}
            <TabPanel p={0} pt={4}>
              {mediaUpdatesData.length === 0 ? (
                <EmptyState />
              ) : (
                <Box bg="white" borderRadius="xl" overflow="hidden">
                  <MediaUpdatesTable
                    data={mediaUpdatesData}
                    setData={setMediaUpdatesData}
                    originalData={originalMediaUpdatesData}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    embedded
                  />
                </Box>
              )}
            </TabPanel>
            {/* Account Tab - Admin: flat table */}
            <TabPanel p={0} pt={4}>
              {accountUpdatesData.length === 0 ? (
                <EmptyState />
              ) : (
                <Box bg="white" borderRadius="xl" overflow="hidden">
                  <AccountUpdatesTable
                    data={accountUpdatesData}
                    originalData={originalAccountUpdatesData}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                  />
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    );
  }

  // Regional Director view: section splits (Special Requests / Other Updates)
  return (
    <Box p={8} bg="gray.50" minH="100vh" mx={-4} mt={0}>
      <Flex align="center" gap={4} mb={4} wrap="wrap">
        <Heading as="h1" size="lg" fontWeight="500">
          Updates
        </Heading>
        <IconButton
          icon={<FiDownload />}
          variant="ghost"
          size="sm"
          aria-label="Download updates"
          color="gray.500"
          onClick={handleDownload}
        />
        <InputGroup maxW="200px">
          <InputLeftElement pointerEvents="none" h="32px">
            <Icon as={FiSearch} color="gray.400" boxSize="14px" />
          </InputLeftElement>
          <Input
            placeholder="Search"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="4px"
            h="32px"
            fontSize="sm"
            _focus={{ borderColor: 'gray.400' }}
            _placeholder={{ color: 'gray.400' }}
            pl={8}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <Popover>
          <PopoverTrigger>
            <IconButton
              aria-label="Filter"
              icon={<HiOutlineAdjustmentsHorizontal />}
              variant="ghost"
              color="gray.500"
              size="sm"
            />
          </PopoverTrigger>
          <PopoverContent w="800px" maxW="90vw" shadow="xl">
            <FilterComponent
              columns={programSectionColumns}
              onFilterChange={(filters) => {}}
            />
          </PopoverContent>
        </Popover>
        <IconButton
          aria-label="Sort"
          icon={<HiArrowsUpDown />}
          variant="ghost"
          color="gray.500"
          size="sm"
        />
        <HStack
          spacing={0}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
        >
          <IconButton
            aria-label="List view"
            icon={<FiList />}
            variant="ghost"
            size="sm"
            color="gray.500"
            borderRadius="md"
          />
          <IconButton
            aria-label="Grid view"
            icon={<BsGrid3X3Gap />}
            variant="ghost"
            size="sm"
            color="gray.500"
            borderRadius="md"
          />
        </HStack>
      </Flex>

      <Tabs index={tabIndex} onChange={setTabIndex} variant="unstyled">
        <TabList>
          <Tab
            _selected={{
              color: 'black',
              borderBottom: '2px solid',
              borderColor: 'teal.400',
            }}
            color="gray.500"
            fontWeight="500"
            pb={2}
            px={0}
            mr={6}
          >
            Program
            <Badge
              ml={2}
              bg="gray.200"
              color="gray.600"
              borderRadius="full"
              fontSize="xs"
              px={2}
            >
              {programUpdatesData.length}
            </Badge>
          </Tab>
          <Tab
            _selected={{
              color: 'black',
              borderBottom: '2px solid',
              borderColor: 'teal.400',
            }}
            color="gray.500"
            fontWeight="500"
            pb={2}
            px={0}
            mr={6}
          >
            Media
            <Badge
              ml={2}
              bg="gray.200"
              color="gray.600"
              borderRadius="full"
              fontSize="xs"
              px={2}
            >
              {mediaUpdatesData.length}
            </Badge>
          </Tab>
          <Tab
            _selected={{
              color: 'black',
              borderBottom: '2px solid',
              borderColor: 'teal.400',
            }}
            color="gray.500"
            fontWeight="500"
            pb={2}
            px={0}
            mr={6}
          >
            Account
            <Badge
              ml={2}
              bg="gray.200"
              color="gray.600"
              borderRadius="full"
              fontSize="xs"
              px={2}
            >
              {accountUpdatesData.length}
            </Badge>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Program Tab */}
          <TabPanel p={0} pt={4}>
            {programUpdatesData.length === 0 ? (
              <>
                <UpdatesSection
                  title="Special Requests"
                  data={[]}
                  originalData={[]}
                  isLoading={isProgramUpdatesLoading}
                  onSave={refetchProgramUpdates}
                  showStatus
                />
                <UpdatesSection
                  title="Other Updates"
                  data={[]}
                  originalData={[]}
                  isLoading={isProgramUpdatesLoading}
                  onSave={refetchProgramUpdates}
                />
                <EmptyState />
              </>
            ) : (
              <>
                <UpdatesSection
                  title="Special Requests"
                  data={specialRequestsData}
                  originalData={originalSpecialRequests}
                  isLoading={isProgramUpdatesLoading}
                  onSave={refetchProgramUpdates}
                  globalSearchQuery={searchQuery}
                  showStatus
                />
                <UpdatesSection
                  title="Other Updates"
                  data={otherUpdatesData}
                  originalData={originalOtherUpdates}
                  isLoading={isProgramUpdatesLoading}
                  onSave={refetchProgramUpdates}
                  globalSearchQuery={searchQuery}
                />
              </>
            )}
          </TabPanel>
          {/* Media Tab */}
          <TabPanel p={0} pt={4}>
            {mediaUpdatesData.length === 0 ? (
              <>
                <UpdatesSection
                  title="Special Requests"
                  data={[]}
                  originalData={[]}
                  isLoading={isLoading}
                  isMedia
                />
                <UpdatesSection
                  title="Other Updates"
                  data={[]}
                  originalData={[]}
                  isLoading={isLoading}
                  isMedia
                />
                <EmptyState />
              </>
            ) : (
              <>
                <UpdatesSection
                  title="Special Requests"
                  data={mediaUpdatesData.filter((m) => m.flagged)}
                  originalData={originalMediaUpdatesData.filter(
                    (m) => m.flagged
                  )}
                  isLoading={isLoading}
                  setData={setMediaUpdatesData}
                  isMedia
                  globalSearchQuery={searchQuery}
                  showStatus
                />
                <UpdatesSection
                  title="Other Updates"
                  data={mediaUpdatesData.filter((m) => !m.flagged)}
                  originalData={originalMediaUpdatesData.filter(
                    (m) => !m.flagged
                  )}
                  isLoading={isLoading}
                  setData={setMediaUpdatesData}
                  isMedia
                  globalSearchQuery={searchQuery}
                />
              </>
            )}
          </TabPanel>
          {/* Account Tab */}
          <TabPanel p={0} pt={4}>
            {accountUpdatesData.length === 0 ? (
              <EmptyState />
            ) : (
              <AccountUpdatesTable
                data={accountUpdatesData}
                originalData={originalAccountUpdatesData}
                isLoading={isLoading}
                searchQuery={searchQuery}
              />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
