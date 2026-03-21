import { useState } from 'react';

import { Box, Flex, HStack, Heading, Icon, IconButton } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FiDownload } from 'react-icons/fi';

import {
  ProgramUpdatesTable,
  downloadProgramUpdatesAsCsv,
} from './ProgramUpdatesTable';
import {
  MediaUpdatesTable,
  downloadMediaUpdatesAsCsv,
} from './MediaUpdatesTable';
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

export function UpdatesSection({
  title,
  data,
  originalData,
  isLoading,
  onSave,
  setData,
  isMedia = false,
  globalSearchQuery = '',
  showStatus = false,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sectionSearch, setSectionSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

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
        <UpdatesSearchInput value={sectionSearch} onChange={setSectionSearch} />
        <UpdatesFilterPopover
          columns={sectionColumns}
          onFilterChange={setActiveFilters}
        />
        <UpdatesSortButton />
        <UpdatesViewModeToggle />
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
}
