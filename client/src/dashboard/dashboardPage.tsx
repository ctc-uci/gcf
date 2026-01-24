import { Flex, Box, Text, Heading } from "@chakra-ui/react";
import StatisticsSummary from "./StatisticsSummary";

const DashboardPage = () => {
  return (
    <Flex
      direction="column"
      align="center"
      minH="100vh"
      gap={6}
      as="main"
    >
      <StatisticsSummary />

      <Box as="section" p={4} textAlign="center">
        <Heading as="h2" size="md" mb={2}>
          Program Table
        </Heading>
        <Text>This is the program table component</Text>
      </Box>
    </Flex>
  );
};

export default DashboardPage;
