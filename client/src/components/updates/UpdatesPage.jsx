import { useState } from 'react';

import {
  Box,
  Center,
  Flex,
  Heading,
  IconButton,
  Spinner,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';

import {
  ProgramUpdatesTable,
  downloadProgramUpdatesAsCsv,
} from './ProgramUpdatesTable';
import {
  MediaUpdatesTable,
  downloadMediaUpdatesAsCsv,
} from './MediaUpdatesTable';
import { AccountUpdatesTable } from './AccountUpdatesTable';
import { ProgramDirectorView } from './programDirectorView/ProgramDirectorView';
import { UpdatesEmptyState } from './UpdatesEmptyState';
import { UpdatesTabListWithBadges } from './UpdatesTabListWithBadges';
import {
  UpdatesSearchInput,
  UpdatesFilterPopover,
} from './UpdatesSharedControls';
import { programSectionColumns } from './updatesColumnConfig';
import { useUpdatesPageData } from './useUpdatesPageData';

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
        <Spinner size="xl" color="gray.500" />
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
    <Flex gap={3} mt={4} mb={4} wrap="wrap">
      <UpdatesSearchInput value={searchQuery} onChange={setSearchQuery} />
      <UpdatesFilterPopover
        columns={programSectionColumns}
        onFilterChange={() => {}}
      />
    </Flex>
  );

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
          isDisabled={!canDownloadCurrentTab}
          onClick={handleDownload}
        />
      </Flex>
      <Tabs index={tabIndex} onChange={setTabIndex} variant="unstyled">
        <Flex gap={3} mt={4} mb={4} wrap="wrap">
          <UpdatesTabListWithBadges
            programCount={tabCounts.program}
            mediaCount={tabCounts.media}
            accountCount={tabCounts.account}
          />
          {adminSearchToolbar}
        </Flex>

        <TabPanels>
          <TabPanel p={0} pt={4}>
            {programUpdatesData.length === 0 ? (
              <UpdatesEmptyState />
            ) : (
              <Box bg="white" borderRadius="xl" overflow="hidden">
                <ProgramUpdatesTable
                  originalData={originalProgramUpdatesData}
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
          <TabPanel p={0} pt={4}>
            {mediaUpdatesData.length === 0 ? (
              <UpdatesEmptyState />
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
          <TabPanel p={0} pt={4}>
            {accountUpdatesData.length === 0 ? (
              <UpdatesEmptyState />
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
};
