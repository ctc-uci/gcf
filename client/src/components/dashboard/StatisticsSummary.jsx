import { useEffect, useState } from 'react';

import { DownloadIcon } from '@chakra-ui/icons';
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
import { useTranslation } from 'react-i18next';

const StatBox = ({ labelKey, number }) => {
  const { t } = useTranslation();
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
        {t(labelKey)}
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

const STAT_LABEL_KEYS_BY_ROLE = {
  Admin: [
    { labelKey: 'statistics.programs', number: 0 },
    { labelKey: 'statistics.students', number: 0 },
    { labelKey: 'statistics.instruments', number: 0 },
  ],
  'Regional Director': [
    { labelKey: 'statistics.programs', number: 0 },
    { labelKey: 'statistics.students', number: 0 },
    { labelKey: 'statistics.instruments', number: 0 },
  ],
  'Program Director': [
    { labelKey: 'statistics.currentEnrollment', number: 0 },
    { labelKey: 'statistics.instrumentsDonated', number: 0 },
  ],
};

function statsFromAdminData(data) {
  return [
    { labelKey: 'statistics.programs', number: data?.totalPrograms ?? 0 },
    { labelKey: 'statistics.students', number: data?.totalStudents ?? 0 },
    { labelKey: 'statistics.instruments', number: data?.totalInstruments ?? 0 },
  ];
}

function statsFromRdData(data) {
  return [
    { labelKey: 'statistics.programs', number: data?.totalPrograms ?? 0 },
    { labelKey: 'statistics.students', number: data?.totalStudents ?? 0 },
    { labelKey: 'statistics.instruments', number: data?.totalInstruments ?? 0 },
  ];
}

function statsFromPdData(data) {
  return [
    { labelKey: 'statistics.currentEnrollment', number: data?.students ?? 0 },
    {
      labelKey: 'statistics.instrumentsDonated',
      number: data?.instruments ?? 0,
    },
  ];
}

const STATS_FROM_RESPONSE = {
  Admin: statsFromAdminData,
  'Regional Director': statsFromRdData,
  'Program Director': statsFromPdData,
};

const StatisticsSummary = ({ refreshTrigger = 0 }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role: role, loading: roleLoading } = useRoleContext();
  const { backend } = useBackendContext();
  const initialStats =
    STAT_LABEL_KEYS_BY_ROLE[role] ?? STAT_LABEL_KEYS_BY_ROLE.Admin;
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  const downloadDataAsCsv = () => {
    const headers = stats.map((stat) => t(stat.labelKey));
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

    setStats(STAT_LABEL_KEYS_BY_ROLE[role] ?? STAT_LABEL_KEYS_BY_ROLE.Admin);

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
          <Heading size="md">{t('statistics.title')}</Heading>
          <IconButton
            aria-label={t('statistics.downloadAria')}
            icon={<DownloadIcon />}
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
                key={stat.labelKey}
                labelKey={stat.labelKey}
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
