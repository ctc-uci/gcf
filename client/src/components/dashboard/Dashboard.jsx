import { Flex, Box } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ProgramTable from "./ProgramTable";
import LessonVideos from "./lessonVideos";
import StatisticsSummary from "./StatisticsSummary";

const Dashboard = () => {
  // TODO(login): Replace useParams userId with AuthContext (currentUser?.uid); then stop passing userId to children.
  const { userId } = useParams();
  const role = "admin"; // TODO(login): Replace with useRoleContext() or AuthContext; then stop passing role to children.
  return (
    <Flex
      direction="column"
      minH="100vh"
      gap={6}
      as="main"
      p={10}
    >
      <StatisticsSummary role={role} userId={userId} />

      <Box as="section">
        {(role === "admin" || role === "regionalDirector") && <ProgramTable role={role} userId={userId} />}
        {role === "programDirector" && <LessonVideos userId={userId} />}
      </Box>
    </Flex>
  );
};

export default Dashboard;
