import { Flex, Box } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import AdminProgramTable from "./AdminProgramTable";
import LessonVideos from "./LessonVideos";
import StatisticsSummary from "./StatisticsSummary";

const DashboardPage = () => {
  const { userid } = useParams();
  const role = "regionalDirector";
  // TODO: remove prop and use AuthContext
  return (
    <Flex
      direction="column"
      minH="100vh"
      gap={6}
      as="main"
      p={10}
    >
      <StatisticsSummary role={role} userId={userid} />

      <Box as="section">
        {(role === "admin" || role === "regionalDirector") && <AdminProgramTable role={role} userId={userid} />}
        {role === "programDirector" && <LessonVideos />}
      </Box>
    </Flex>
  );
};

export default DashboardPage;
