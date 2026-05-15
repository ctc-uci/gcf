import { useState } from 'react';

import { DownloadIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';

import { EmptyStateBadge } from '@/components/badges/EmptyStateBadge';
import { useTranslation } from 'react-i18next';

import { AccountUpdatesTable } from './AccountUpdatesTable';
import {
  mediaSectionColumns,
  programSectionColumns,
} from './config/updatesColumnConfig';
import {
  UpdatesFilterPopover,
  UpdatesSearchInput,
} from './config/UpdatesSharedControls';
import {
  UPDATES_TAB_BASE_PROPS,
  UPDATES_TAB_SELECTED_PROPS,
  UpdatesTabCountBadge,
} from './config/UpdatesTabListWithBadges';
import { useUpdatesPageData } from './config/useUpdatesPageData';
import { downloadMediaUpdatesAsCsv } from './downloadMediaUpdatesAsCsv';
import { downloadProgramUpdatesAsCsv } from './downloadProgramUpdatesAsCsv';
import { MediaUpdatesTable } from './MediaUpdatesTable';
import { ProgramDirectorView } from './programDirectorView/ProgramDirectorView';
import { ProgramUpdatesTable } from './ProgramUpdatesTable';

export const UpdatesPage = () => {
  const { t } = useTranslation();
  const {
    role,
    programUpdatesData,
    mediaUpdatesData,
    originalAccountUpdatesData,
    originalMediaUpdatesData,
    originalProgramUpdatesData,
    setMediaUpdatesData,
    accountUpdatesData,
    isLoading,
    isProgramLoading,
    refetchProgramUpdates,
    refetchAccountUpdates,
  } = useUpdatesPageData();

  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState([]);

  const handleTabChange = (index) => {
    setTabIndex(index);
    setActiveFilters([]);
  };

  const filterColumns =
    tabIndex === 1 ? mediaSectionColumns : programSectionColumns;

  const handleDownload = () => {
    if (tabIndex === 0) downloadProgramUpdatesAsCsv(programUpdatesData, t);
    else if (tabIndex === 1) downloadMediaUpdatesAsCsv(mediaUpdatesData, t);
  };

  if (
    !(
      role === 'Admin' ||
      role === 'Super Admin' ||
      role === 'Regional Director'
    )
  ) {
    return (
      <ProgramDirectorView
        data={programUpdatesData}
        isLoading={isLoading || isProgramLoading}
        onSave={refetchProgramUpdates}
      />
    );
  }

  const tabCounts = {
    program: programUpdatesData.length,
    media: mediaUpdatesData.length,
    account: accountUpdatesData.length,
  };

  const adminSearchToolbar = (
    <Flex
      gap={3}
      mt={4}
      mb={4}
      wrap="wrap"
    >
      <UpdatesSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <UpdatesFilterPopover
        columns={filterColumns}
        onFilterChange={setActiveFilters}
      />
    </Flex>
  );

  return (
    <Box
      p={8}
      bg="gray.50"
      minH="100vh"
      w="100%"
      maxW="100%"
      mx={-4}
      mt={0}
      overflowX="hidden"
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
          onClick={handleDownload}
        />
      </Flex>
      <Tabs
        index={tabIndex}
        onChange={handleTabChange}
        variant="unstyled"
      >
        <Flex
          gap={3}
          mt={4}
          mb={4}
          wrap="wrap"
        >
          <TabList>
            <Tab
              _selected={UPDATES_TAB_SELECTED_PROPS}
              {...UPDATES_TAB_BASE_PROPS}
            >
              {t('updates.tabProgram')}
              <UpdatesTabCountBadge count={tabCounts.program} />
            </Tab>
            <Tab
              _selected={UPDATES_TAB_SELECTED_PROPS}
              {...UPDATES_TAB_BASE_PROPS}
            >
              {t('updates.tabMedia')}
              <UpdatesTabCountBadge count={tabCounts.media} />
            </Tab>
            <Tab
              _selected={UPDATES_TAB_SELECTED_PROPS}
              {...UPDATES_TAB_BASE_PROPS}
            >
              {t('updates.tabAccount')}
              <UpdatesTabCountBadge count={tabCounts.account} />
            </Tab>
          </TabList>
          {adminSearchToolbar}
        </Flex>

        <TabPanels>
          <TabPanel
            p={0}
            pt={4}
          >
            <Box
              bg="white"
              borderRadius="xl"
              overflow="hidden"
            >
              {isLoading || originalProgramUpdatesData.length > 0 ? (
                <Box
                  bg="white"
                  borderRadius="xl"
                  overflow="hidden"
                >
                  <ProgramUpdatesTable
                    originalData={originalProgramUpdatesData}
                    isLoading={isLoading}
                    onSave={refetchProgramUpdates}
                    searchQuery={searchQuery}
                    activeFilters={activeFilters}
                    showStatus
                    showFlagAndType
                    embedded
                  />
                </Box>
              ) : (
                <EmptyStateBadge variant="no-updates" />
              )}
            </Box>
          </TabPanel>
          <TabPanel
            p={0}
            pt={4}
          >
            {isLoading || mediaUpdatesData.length > 0 ? (
              <Box
                bg="white"
                borderRadius="xl"
                overflow="hidden"
              >
                <MediaUpdatesTable
                  data={mediaUpdatesData}
                  setData={setMediaUpdatesData}
                  originalData={originalMediaUpdatesData}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  activeFilters={activeFilters}
                  embedded
                />
              </Box>
            ) : (
              <EmptyStateBadge variant="no-updates" />
            )}
          </TabPanel>
          <TabPanel
            p={0}
            pt={4}
          >
            {isLoading || accountUpdatesData.length > 0 ? (
              <Box
                bg="white"
                borderRadius="xl"
                overflow="hidden"
              >
                <AccountUpdatesTable
                  data={accountUpdatesData}
                  originalData={originalAccountUpdatesData}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onAccountChangeUpdated={refetchAccountUpdates}
                />
              </Box>
            ) : (
              <EmptyStateBadge variant="no-updates" />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
