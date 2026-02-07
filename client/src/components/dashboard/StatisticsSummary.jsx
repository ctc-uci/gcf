import { useEffect, useState } from "react";

import {
  Box,
  Center,
  Heading,
  HStack,
  IconButton,
  Spinner,
  VStack,
} from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";
import { MdOutlineFileDownload } from "react-icons/md";

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

function keysToCamel(data) {
  if (data === "Admin") {
    return "admin";
  } else if (data === "Regional Director") {
    return "regionalDirector";
  } else if (data === "Program Director") {
    return "programDirector";
  }
}

const STATS_FROM_RESPONSE = {
  admin: statsFromAdminData,
  regionalDirector: statsFromRdData,
  programDirector: statsFromPdData,
};

// TODO(login): Replace role prop with useRoleContext() or AuthContext; replace userId prop with AuthContext (currentUser?.uid).
const StatisticsSummary = () => {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role: realRole, loading: roleLoading } = useRoleContext();
  const role = keysToCamel(realRole);
  const { backend } = useBackendContext();
  const initialStats = STAT_LABELS_BY_ROLE[role] ?? STAT_LABELS_BY_ROLE.admin;
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (roleLoading) return;

    const route = getRouteByRole(role, userId);
    const mapResponse = STATS_FROM_RESPONSE[role];

    if (!route || !mapResponse) {
      setIsLoading(false);
      return;
    }

    setStats(STAT_LABELS_BY_ROLE[role] ?? STAT_LABELS_BY_ROLE.admin);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await backend.get(route);
        const nextStats = mapResponse(res.data ?? {});
        setStats(nextStats);
      } catch (err) {
        console.error("Error fetching statistics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, roleLoading, userId, backend]);

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
          {isLoading ? (
            <Center
              py={8}
              minH="120px"
            >
              <Spinner size="lg" />
            </Center>
          ) : (
            stats.map((stat) => (
              <StatBox
                key={stat.label}
                label={stat.label}
                number={stat.number}
              />
            ))
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default StatisticsSummary;
