import { Flex, Box } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ProgramTable from "./ProgramTable";
import LessonVideos from "./LessonVideos";
import StatisticsSummary from "./StatisticsSummary";

const Dashboard = () => {
  const { userid } = useParams();
  const role = "programDirector";
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
        {(role === "admin" || role === "regionalDirector") && <ProgramTable role={role} userId={userid} />}
        {role === "programDirector" && <LessonVideos userId={userid} />}
      </Box>
    </Flex>
  );
};

export default Dashboard;
