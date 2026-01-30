import { Flex, Box } from "@chakra-ui/react";
import AdminProgramTable from "./AdminProgramTable";
import LessonVideos from "./lessonVideos";
import StatisticsSummary from "./StatisticsSummary";

const DashboardPage = () => {
  const role = "admin";

  return (
    <Flex
      direction="column"
      minH="100vh"
      gap={6}
      as="main"
      p={10}
    >
      <StatisticsSummary role={role} />

      <Box as="section">
        {(role === "admin" || role === "rd") && <AdminProgramTable role={role} />}
        {role === "pd" && <LessonVideos />}
      </Box>
    </Flex>
  );
};

export default DashboardPage;
