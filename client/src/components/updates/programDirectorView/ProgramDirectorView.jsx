import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { FiDownload } from 'react-icons/fi';

import { downloadProgramUpdatesAsCsv } from '../ProgramUpdatesTable';
import { CreateUpdateDrawer } from '../createForm/CreateUpdateDrawer';
import {
  UpdatesSearchInput,
  UpdatesFilterPopover,
  UpdatesViewModeToggle,
} from '../UpdatesSharedControls';
import { applyFilters } from '../../../contexts/hooks/TableFilter';
import { useTableSort } from '../../../contexts/hooks/TableSort';
import { programDirectorFilterColumns } from '../updatesColumnConfig';
import { ProgramDirectorUpdatesTable } from './ProgramDirectorUpdatesTable';

export const ProgramDirectorView = ({ data, isLoading, onSave }) => {
  const [searchQuery, setSearchQuery] = useState('');
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

  const instrumentRows = useMemo(
    () => displayData.filter((row) => row.hasInstrumentChange === true),
    [displayData]
  );
  const studentRows = useMemo(
    () => displayData.filter((row) => row.hasEnrollmentChange === true),
    [displayData]
  );

  const [instrumentSorted, setInstrumentSorted] = useState(null);
  const [studentSorted, setStudentSorted] = useState(null);

  useEffect(() => {
    setInstrumentSorted(null);
  }, [instrumentRows]);

  useEffect(() => {
    setStudentSorted(null);
  }, [studentRows]);

  const instrumentSort = useTableSort(instrumentRows, setInstrumentSorted);
  const studentSort = useTableSort(studentRows, setStudentSorted);

  const instrumentTableData = instrumentSorted ?? instrumentRows;
  const studentTableData = studentSorted ?? studentRows;

  return (
    <Box p={8} bg="gray.50" minH="100vh" mx={-4} mt={0}>
      <Flex align="center" gap={4} mb={4} wrap="wrap">
        <HStack spacing={2}>
          <Heading as="h1" size="lg" fontWeight="500">
            Updates
          </Heading>

          <IconButton
            icon={<FiDownload />}
            variant="ghost"
            size="sm"
            aria-label="Download updates"
            color="gray.500"
            onClick={() => downloadProgramUpdatesAsCsv(data)}
          />
        </HStack>

        <UpdatesSearchInput value={searchQuery} onChange={setSearchQuery} />
        <UpdatesFilterPopover
          columns={programDirectorFilterColumns}
          onFilterChange={setActiveFilters}
        />
        <UpdatesViewModeToggle />

        <Button
          ml="auto"
          flexShrink={0}
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
      <Tabs>
        <TabList>
          <Tab>Instrument</Tab>
          <Tab>Student</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ProgramDirectorUpdatesTable
              variant="instrument"
              tableData={instrumentTableData}
              isLoading={isLoading}
              handleSort={instrumentSort.handleSort}
              sortOrder={instrumentSort.sortOrder}
            />
          </TabPanel>
          <TabPanel>
            <ProgramDirectorUpdatesTable
              variant="student"
              tableData={studentTableData}
              isLoading={isLoading}
              handleSort={studentSort.handleSort}
              sortOrder={studentSort.sortOrder}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <CreateUpdateDrawer
        isOpen={createDrawerDisclosure.isOpen}
        onClose={createDrawerDisclosure.onClose}
        onSave={onSave}
      />
    </Box>
  );
};
