import { useState } from 'react';

import {
  Badge,
  Box,
  Center,
  Flex,
  HStack,
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
import { ProgramDirectorView } from './ProgramDirectorView';
import { UpdatesEmptyState } from './UpdatesEmptyState';
import { UpdatesTabListWithBadges } from './UpdatesTabListWithBadges';
import {
  UpdatesSearchInput,
  UpdatesFilterPopover,
  UpdatesSortButton,
  UpdatesViewModeToggle,
} from './UpdatesSharedControls';
import {
  programSectionColumns,
  mediaSectionColumns,
} from './updatesColumnConfig';
import { useUpdatesPageData } from './useUpdatesPageData';
import { UpdatesSection } from './UpdatesSection';

const pageShellProps = {
  p: 8,
  bg: 'gray.50',
  minH: '100vh',
  mx: -4,
  mt: 0,
};

export const UpdatesPage = () => {
  const {
    role,
    programUpdatesData,
    setProgramUpdatesData,
    mediaUpdatesData,
    setMediaUpdatesData,
    originalMediaUpdatesData,
    accountUpdatesData,
    originalAccountUpdatesData,
    isLoading,
    isProgramUpdatesLoading,
    refetchProgramUpdates,
    specialRequestsData,
    otherUpdatesData,
    originalSpecialRequests,
    originalOtherUpdates,
    mediaFlagged,
    mediaNotFlagged,
    originalMediaFlagged,
    originalMediaNotFlagged,
  } = useUpdatesPageData();

  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const handleDownload = () => {
    if (tabIndex === 0) {
      downloadProgramUpdatesAsCsv(programUpdatesData);
    } else if (tabIndex === 1) {
      downloadMediaUpdatesAsCsv(mediaUpdatesData);
    }
  };

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
    <Flex align="center" gap={3} mt={4} mb={4} wrap="wrap">
      <UpdatesSearchInput value={searchQuery} onChange={setSearchQuery} />
      <UpdatesFilterPopover
        columns={programSectionColumns}
        onFilterChange={() => {}}
      />
      <UpdatesSortButton />
    </Flex>
  );

  if (isAdmin) {
    return (
      <Box {...pageShellProps}>
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
          <UpdatesTabListWithBadges
            programCount={tabCounts.program}
            mediaCount={tabCounts.media}
            accountCount={tabCounts.account}
          />
          {adminSearchToolbar}

          <TabPanels>
            <TabPanel p={0} pt={4}>
              {programUpdatesData.length === 0 ? (
                <UpdatesEmptyState />
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
  }

  // Regional Director
  return (
    <Box {...pageShellProps}>
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
        <UpdatesSearchInput value={searchQuery} onChange={setSearchQuery} />
        <UpdatesFilterPopover
          columns={programSectionColumns}
          onFilterChange={() => {}}
        />
        <UpdatesSortButton />
        <UpdatesViewModeToggle />
      </Flex>

      <Tabs index={tabIndex} onChange={setTabIndex} variant="unstyled">
        <UpdatesTabListWithBadges
          programCount={tabCounts.program}
          mediaCount={tabCounts.media}
          accountCount={tabCounts.account}
        />

        <TabPanels>
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
                <UpdatesEmptyState />
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
                <UpdatesEmptyState />
              </>
            ) : (
              <>
                <UpdatesSection
                  title="Special Requests"
                  data={mediaFlagged}
                  originalData={originalMediaFlagged}
                  isLoading={isLoading}
                  setData={setMediaUpdatesData}
                  isMedia
                  globalSearchQuery={searchQuery}
                  showStatus
                />
                <UpdatesSection
                  title="Other Updates"
                  data={mediaNotFlagged}
                  originalData={originalMediaNotFlagged}
                  isLoading={isLoading}
                  setData={setMediaUpdatesData}
                  isMedia
                  globalSearchQuery={searchQuery}
                />
              </>
            )}
          </TabPanel>
          <TabPanel p={0} pt={4}>
            {accountUpdatesData.length === 0 ? (
              <UpdatesEmptyState />
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
