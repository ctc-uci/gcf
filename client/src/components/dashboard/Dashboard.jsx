import { Box, Flex } from "@chakra-ui/react";

import { useRoleContext } from "@/contexts/hooks/useRoleContext";

import LessonVideos from "./lessonVideos";
import ProgramTable from "./ProgramTable";
import StatisticsSummary from "./StatisticsSummary";

function keysToCamel(data) {
  if (data === "Admin") {
    return "admin";
  } else if (data === "Regional Director") {
    return "regionalDirector";
  } else if (data === "Program Director") {
    return "programDirector";
  }
}

const Dashboard = () => {
  const { role } = useRoleContext();
  const camelRole = keysToCamel(role);

  return (
    <Flex
      direction="column"
      minH="100vh"
      gap={6}
      as="main"
      p={10}
    >
      <StatisticsSummary />

      <Box as="section">
        {(camelRole === "admin" || camelRole === "regionalDirector") && (
          <ProgramTable />
        )}
        {camelRole === "programDirector" && <LessonVideos />}
      </Box>
    </Flex>
  );
};

export default Dashboard;
