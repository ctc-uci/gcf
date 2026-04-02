import { useState } from 'react';

import {
  Box,
  Center,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';

import { EmptyStateBadge } from '@/components/badges/EmptyStateBadge';
import { FiDownload } from 'react-icons/fi';

import { AccountUpdatesTable } from './AccountUpdatesTable';
import { programSectionColumns } from './config/updatesColumnConfig';
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
  const {
    role,
    programUpdatesData,
    originalProgramUpdatesData,
    mediaUpdatesData,
    setMediaUpdatesData,
    originalMediaUpdatesData,
    accountUpdatesData,
    originalAccountUpdatesData,
    isLoading,
    isProgramUpdatesLoading,
    refetchProgramUpdates,
  } = useUpdatesPageData();

  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const handleDownload = () => {
    if (tabIndex === 0) downloadProgramUpdatesAsCsv(programUpdatesData);
    else if (tabIndex === 1) downloadMediaUpdatesAsCsv(mediaUpdatesData);
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner
          size="xl"
          color="gray.500"
        />
      </Center>
    );
  }

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
        isLoading={isLoading || isProgramUpdatesLoading}
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
        columns={programSectionColumns}
        onFilterChange={() => {}}
      />
    </Flex>
  );

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
      <Tabs
        index={tabIndex}
        onChange={setTabIndex}
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
              Program
              <UpdatesTabCountBadge count={tabCounts.program} />
            </Tab>
            <Tab
              _selected={UPDATES_TAB_SELECTED_PROPS}
              {...UPDATES_TAB_BASE_PROPS}
            >
              Media
              <UpdatesTabCountBadge count={tabCounts.media} />
            </Tab>
            <Tab
              _selected={UPDATES_TAB_SELECTED_PROPS}
              {...UPDATES_TAB_BASE_PROPS}
            >
              Account
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
            {programUpdatesData.length === 0 ? (
              <EmptyStateBadge variant="no-updates" />
            ) : (
              <Box
                bg="white"
                borderRadius="xl"
                overflow="hidden"
              >
                <ProgramUpdatesTable
                  originalData={originalProgramUpdatesData}
                  isLoading={isProgramUpdatesLoading}
                  onSave={refetchProgramUpdates}
                  searchQuery={searchQuery}
                  showStatus
                  showFlagAndType
                />
              </Box>
            )}
          </TabPanel>
          <TabPanel
            p={0}
            pt={4}
          >
            {mediaUpdatesData.length === 0 ? (
              <EmptyStateBadge variant="no-updates" />
            ) : (
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
                />
              </Box>
            )}
          </TabPanel>
          <TabPanel
            p={0}
            pt={4}
          >
            {accountUpdatesData.length === 0 ? (
              <EmptyStateBadge variant="no-updates" />
            ) : (
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
                />
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
