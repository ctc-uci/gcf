import { useEffect, useMemo, useState } from 'react';

import { AddIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import { applyFilters } from '../../../contexts/hooks/TableFilter';
import { useTableSort } from '../../../contexts/hooks/TableSort';
import { programDirectorFilterColumns } from '../config/updatesColumnConfig';
import {
  UpdatesFilterPopover,
  UpdatesSearchInput,
  UpdatesViewModeToggle,
} from '../config/UpdatesSharedControls';
import {
  UPDATES_TAB_BASE_PROPS,
  UPDATES_TAB_SELECTED_PROPS,
  UpdatesTabCountBadge,
} from '../config/UpdatesTabListWithBadges';
import { downloadProgramUpdatesAsCsv } from '../downloadProgramUpdatesAsCsv';
import { CreateUpdateDrawer } from '../forms/createForm/CreateUpdateDrawer';
import { ProgramDirectorUpdatesTable } from './ProgramDirectorUpdatesTable';

export const ProgramDirectorView = ({ data, isLoading, onSave }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const updateDrawerDisclosure = useDisclosure();
  const [drawerDraft, setDrawerDraft] = useState(null);

  const openCreateUpdate = () => {
    setDrawerDraft(null);
    updateDrawerDisclosure.onOpen();
  };

  const openEditUpdate = (row, variant) => {
    setDrawerDraft({
      id: row.id,
      variant,
      instrumentName: row.instrumentName ?? null,
    });
    updateDrawerDisclosure.onOpen();
  };

  const handleUpdateDrawerClose = () => {
    setDrawerDraft(null);
    updateDrawerDisclosure.onClose();
  };

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
    <Box
      p={8}
      bg="gray.50"
      minH="100vh"
      mx={-4}
      mt={0}
    >
      <Flex
        align="center"
        gap={4}
        mb={4}
        wrap="wrap"
      >
        <Heading
          as="h1"
          size="lg"
          fontWeight="500"
        >
          {t('updates.pageTitle')}
        </Heading>
        <IconButton
          icon={<DownloadIcon />}
          variant="ghost"
          size="sm"
          aria-label={t('updates.downloadAria')}
          color="gray.500"
          onClick={() => downloadProgramUpdatesAsCsv(data, t)}
        />
        <UpdatesSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
        />
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
          onClick={openCreateUpdate}
        >
          {t('updates.newUpdate')}
        </Button>
      </Flex>

      <Tabs>
        <TabList
          w="100%"
          display="flex"
          mt={4}
          mb={4}
          gap={0}
        >
          <Tab
            flex="1"
            justifyContent="center"
            _selected={UPDATES_TAB_SELECTED_PROPS}
            {...UPDATES_TAB_BASE_PROPS}
            mr={0}
          >
            {t('updates.tabInstrument')}
            <UpdatesTabCountBadge count={instrumentRows.length} />
          </Tab>
          <Tab
            flex="1"
            justifyContent="center"
            _selected={UPDATES_TAB_SELECTED_PROPS}
            {...UPDATES_TAB_BASE_PROPS}
            mr={0}
          >
            {t('updates.tabStudent')}
            <UpdatesTabCountBadge count={studentRows.length} />
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            p={0}
            pt={4}
          >
            <ProgramDirectorUpdatesTable
              variant="instrument"
              tableData={instrumentTableData}
              isLoading={isLoading}
              handleSort={instrumentSort.handleSort}
              sortOrder={instrumentSort.sortOrder}
              onRowClick={(row) => openEditUpdate(row, 'instrument')}
            />
          </TabPanel>
          <TabPanel
            p={0}
            pt={4}
          >
            <ProgramDirectorUpdatesTable
              variant="student"
              tableData={studentTableData}
              isLoading={isLoading}
              handleSort={studentSort.handleSort}
              sortOrder={studentSort.sortOrder}
              onRowClick={(row) => openEditUpdate(row, 'student')}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <CreateUpdateDrawer
        isOpen={updateDrawerDisclosure.isOpen}
        onClose={handleUpdateDrawerClose}
        onSave={onSave}
        editProgramUpdateId={drawerDraft?.id ?? null}
        editVariant={drawerDraft?.variant ?? null}
        editInstrumentName={drawerDraft?.instrumentName ?? null}
      />
    </Box>
  );
};
