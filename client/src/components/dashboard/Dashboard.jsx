import { Flex, Box } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ProgramTable from "./ProgramTable";
import LessonVideos from "./LessonVideos";
import StatisticsSummary from "./StatisticsSummary";

const Dashboard = () => {
  // TODO(login): Replace useParams userid with AuthContext (currentUser?.uid); then stop passing userId to children.
  const { userid } = useParams();
  const role = "admin"; // TODO(login): Replace with useRoleContext() or AuthContext; then stop passing role to children.
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
