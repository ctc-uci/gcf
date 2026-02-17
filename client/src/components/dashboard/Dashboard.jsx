import { Box, Flex } from "@chakra-ui/react";

import { useRoleContext } from "@/contexts/hooks/useRoleContext";

import LessonVideos from "./lessonVideos";
import ProgramTable from "./ProgramTable";
import StatisticsSummary from "./StatisticsSummary";

const Dashboard = () => {
  const { role } = useRoleContext();
  return (
    <Flex
      direction="column"
      minH="100vh"
      gap={6}
      as="main"
      p={10}w
    >
      <StatisticsSummary />

      <Box as="section">
        {(role === "Admin" || role === "Regional Director") && (
          <ProgramTable />
        )}
        {role === "Program Director" && <LessonVideos />}
      </Box>
    </Flex>
  );
};

export default Dashboard;
