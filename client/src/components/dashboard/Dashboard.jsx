import { useState } from 'react';

import {
  Box,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';

import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { useTranslation } from 'react-i18next';

import LessonVideos from './lessonVideos';
import PDF from './PDF';
import ProgramTable from './ProgramTable';
import StatisticsSummary from './StatisticsSummary';

const Dashboard = () => {
  const { role } = useRoleContext();
  const { t } = useTranslation();
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <Flex
      direction="column"
      minH="100vh"
      gap={6}
      as="main"
      p={10}
      w="100%"
    >
      {!selectedPlaylist && (
        <StatisticsSummary refreshTrigger={statsRefreshTrigger} />
      )}

      <Box
        as="section"
        w="100%"
        maxW="100%"
      >
        {(role === 'Super Admin' ||
          role === 'Admin' ||
          role === 'Regional Director') && (
          <ProgramTable
            onStatsRefresh={() => setStatsRefreshTrigger((t) => t + 1)}
          />
        )}
        {role === 'Program Director' && (
          <Box>
            <Heading
              size="lg"
              fontWeight="extrabold"
              mb={4}
            >
              {t('lessonVideos.title')}
            </Heading>
            <Tabs>
              <TabList>
                <Tab _selected={{ borderBottomColor: 'teal.500' }}>Videos</Tab>
                <Tab _selected={{ borderBottomColor: 'teal.500' }}>PDFs</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <LessonVideos
                    selectedPlaylist={selectedPlaylist}
                    setSelectedPlaylist={setSelectedPlaylist}
                    selectedVideo={selectedVideo}
                    setSelectedVideo={setSelectedVideo}
                  />
                </TabPanel>
                <TabPanel>
                  <PDF />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default Dashboard;
