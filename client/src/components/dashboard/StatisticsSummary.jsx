import { useEffect, useState } from "react";

import { Box, Heading, HStack, IconButton, VStack } from "@chakra-ui/react";

import { MdOutlineFileDownload } from "react-icons/md";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

const StatBox = ({ label, number }) => {
  return (
    <Box
      maxW="200px"
      p={6}
      border="1px solid"
      borderColor="gray.300"
      bg="white"
      color="black"
      borderRadius="md"
      display="flex"
      flexDirection="column"
    >
      <Box
        fontSize="xl"
        mb={4}
      >
        {label}
      </Box>
      <Box fontSize="2xl">{number}</Box>
    </Box>
  );
};

const getRouteByRole = (role, userId) => {
  const routes = {
    admin: "/admin/stats",
    regionalDirector: `/regional-directors/me/${userId}/stats`,
    programDirector: `/program-directors/me/${userId}/stats`,
  };
  return routes[role];
};

const STAT_LABELS_BY_ROLE = {
  admin: [
    { label: "Programs", number: 0 },
    { label: "Students", number: 0 },
    { label: "Instruments", number: 0 },
  ],
  regionalDirector: [
    { label: "Programs", number: 0 },
    { label: "Students", number: 0 },
    { label: "Instruments", number: 0 },
  ],
  programDirector: [
    { label: "Current Enrollment", number: 0 },
    { label: "Instruments Donated", number: 0 },
  ],
};

function statsFromAdminData(data) {
  return [
    { label: "Programs", number: data?.totalPrograms ?? 0 },
    { label: "Students", number: data?.totalStudents ?? 0 },
    { label: "Instruments", number: data?.totalInstruments ?? 0 },
  ];
}

function statsFromRdData(data) {
  return [
    { label: "Programs", number: data?.totalPrograms ?? 0 },
    { label: "Students", number: data?.totalStudents ?? 0 },
    { label: "Instruments", number: data?.totalInstruments ?? 0 },
  ];
}

function statsFromPdData(data) {
  return [
    { label: "Current Enrollment", number: data?.students ?? 0 },
    { label: "Instruments Donated", number: data?.instruments ?? 0 },
  ];
}

const STATS_FROM_RESPONSE = {
  admin: statsFromAdminData,
  regionalDirector: statsFromRdData,
  programDirector: statsFromPdData,
};

const StatisticsSummary = ({ role = "admin", userId }) => {
  // TODO: remove prop and use AuthContext
  const { backend } = useBackendContext();
  const initialStats = STAT_LABELS_BY_ROLE[role] ?? STAT_LABELS_BY_ROLE.admin;
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const route = getRouteByRole(role, userId);
    const mapResponse = STATS_FROM_RESPONSE[role];

    if (!route || !mapResponse) return;

    setStats(STAT_LABELS_BY_ROLE[role] ?? STAT_LABELS_BY_ROLE.admin);

    const fetchData = async () => {
      try {
        const res = await backend.get(route);
        const nextStats = mapResponse(res.data ?? {});
        setStats(nextStats);
      } catch (err) {
        console.error("Error fetching statistics:", err);
      }
    };

    fetchData();
  }, [role, userId, backend]);

  return (
    <Box as="section">
      <VStack
        spacing={6}
        align="left"
      >
        <HStack>
          <Heading size="md">Statistics Summary</Heading>
          <IconButton
            aria-label="download"
            icon={<MdOutlineFileDownload />}
            size="sm"
            variant="ghost"
          />
        </HStack>

        <HStack spacing={6}>
          {stats.map((stat) => (
            <StatBox
              key={stat.label}
              label={stat.label}
              number={stat.number}
            />
          ))}
        </HStack>
      </VStack>
    </Box>
  );
};

export default StatisticsSummary;
