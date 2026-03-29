import { useEffect, useState } from 'react';

import {
  Box,
  Heading,
  HStack,
  IconButton,
  Spinner,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';
import { MdOutlineFileDownload } from 'react-icons/md';

const StatBox = ({ label, number }) => {
  return (
    <Box
      flex="1"
      minW={0}
      p={6}
      borderRadius="md"
      bgGradient="linear(to-r, gray.600, gray.400)"
      color="white"
      boxShadow="md"
      display="flex"
      flexDirection="column"
    >
      <Box
        fontSize="xl"
        mb={4}
        color="whiteAlpha.900"
      >
        {label}
      </Box>
      <Box
        fontSize="4xl"
        fontWeight="semibold"
      >
        {number}
      </Box>
    </Box>
  );
};

const getRouteByRole = (role, userId) => {
  const routes = {
    Admin: '/admin/stats',
    'Regional Director': `/regional-directors/me/${userId}/stats`,
    'Program Director': `/program-directors/me/${userId}/stats`,
  };
  return routes[role];
};

const STAT_LABELS_BY_ROLE = {
  Admin: [
    { label: 'Programs', number: 0 },
    { label: 'Students', number: 0 },
    { label: 'Instruments', number: 0 },
  ],
  'Regional Director': [
    { label: 'Programs', number: 0 },
    { label: 'Students', number: 0 },
    { label: 'Instruments', number: 0 },
  ],
  'Program Director': [
    { label: 'Current Enrollment', number: 0 },
    { label: 'Instruments Donated', number: 0 },
  ],
};

function statsFromAdminData(data) {
  return [
    { label: 'Programs', number: data?.totalPrograms ?? 0 },
    { label: 'Students', number: data?.totalStudents ?? 0 },
    { label: 'Instruments', number: data?.totalInstruments ?? 0 },
  ];
}

function statsFromRdData(data) {
  return [
    { label: 'Programs', number: data?.totalPrograms ?? 0 },
    { label: 'Students', number: data?.totalStudents ?? 0 },
    { label: 'Instruments', number: data?.totalInstruments ?? 0 },
  ];
}

function statsFromPdData(data) {
  return [
    { label: 'Current Enrollment', number: data?.students ?? 0 },
    { label: 'Instruments Donated', number: data?.instruments ?? 0 },
  ];
}

const STATS_FROM_RESPONSE = {
  Admin: statsFromAdminData,
  'Regional Director': statsFromRdData,
  'Program Director': statsFromPdData,
};

const StatisticsSummary = ({ refreshTrigger = 0 }) => {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role: role, loading: roleLoading } = useRoleContext();
  const { backend } = useBackendContext();
  const initialStats = STAT_LABELS_BY_ROLE[role] ?? STAT_LABELS_BY_ROLE.Admin;
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  const downloadDataAsCsv = () => {
    const headers = stats.map((stat) => stat.label);
    const rows = [stats.map((stat) => escapeCsvValue(stat.number))];

    downloadCsv(
      headers,
      rows,
      `statistics-summary-${getFilenameTimestamp()}.csv`
    );
  };

  useEffect(() => {
    if (roleLoading) return;

    const route = getRouteByRole(role, userId);
    const mapResponse = STATS_FROM_RESPONSE[role];

    if (!route || !mapResponse) {
      setIsLoading(false);
      return;
    }

    setStats(STAT_LABELS_BY_ROLE[role] ?? STAT_LABELS_BY_ROLE.Admin);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await backend.get(route);
        const nextStats = mapResponse(res.data ?? {});
        setStats(nextStats);
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, roleLoading, userId, backend, refreshTrigger]);

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
            onClick={downloadDataAsCsv}
            size="sm"
            variant="ghost"
          />
        </HStack>

        <Box
          position="relative"
          w="full"
        >
          <HStack
            spacing={6}
            minH="120px"
            w="full"
            align="stretch"
          >
            {stats.map((stat) => (
              <StatBox
                key={stat.label}
                label={stat.label}
                number={stat.number}
              />
            ))}
          </HStack>
          {isLoading && (
            <Box
              position="absolute"
              inset={0}
              bg="whiteAlpha.800"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={1}
              borderRadius="md"
            >
              <Spinner size="lg" />
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default StatisticsSummary;
