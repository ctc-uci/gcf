import { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';

import { useRoleContext } from '@/contexts/hooks/useRoleContext';

import LessonVideos from './LessonVideos';
import ProgramTable from './ProgramTable';
import StatisticsSummary from './StatisticsSummary';

const Dashboard = () => {
  const { role } = useRoleContext();
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  return (
    <Flex direction="column" minH="100vh" gap={6} as="main" p={10} w>
      <StatisticsSummary refreshTrigger={statsRefreshTrigger} />

      <Box as="section">
        {(role === 'Super Admin' ||
          role === 'Admin' ||
          role === 'Regional Director') && (
          <ProgramTable
            onStatsRefresh={() => setStatsRefreshTrigger((t) => t + 1)}
          />
        )}
        {role === 'Program Director' && <LessonVideos />}
      </Box>
    </Flex>
  );
};

export default Dashboard;
