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

const StatisticsSummary = ({ role = "admin" }) => {
  const { backend } = useBackendContext();
  const [stats, setStats] = useState(
    role === "pd"
      ? [
          { label: "Current Enrollment", number: 0 },
          { label: "Instruments Donated", number: 0 },
        ]
      : [
          { label: "Programs", number: 0 },
          { label: "Students", number: 0 },
          { label: "Instruments", number: 0 },
        ]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "admin") {
          const [programsRes, enrollmentRes, instrumentRes] = await Promise.all([
            backend.get("/program"),
            backend.get("/enrollmentChange"),
            backend.get("/instrument-changes")
          ]);

          const programsData = Array.isArray(programsRes.data) ? programsRes.data : [];

          let enrollmentData = [];
          if (Array.isArray(enrollmentRes.data)) {
            enrollmentData = enrollmentRes.data;
          } else if (enrollmentRes.data && typeof enrollmentRes.data === 'object') {
            enrollmentData = [enrollmentRes.data];
          }

          const instrumentData = Array.isArray(instrumentRes.data) ? instrumentRes.data : [];

          const totalPrograms = programsData.length;
          const totalStudents = enrollmentData.reduce(
            (sum, e) => sum + (Number(e.enrollmentChange) || 0),
            0
          );
          const totalInstruments = instrumentData.reduce(
            (sum, i) => sum + (Number(i.amountChanged) || 0),
            0
          );

          setStats([
            { label: "Programs", number: totalPrograms },
            { label: "Students", number: totalStudents },
            { label: "Instruments", number: totalInstruments },
          ]);
        }

        if (role === "rd") {
          const regionId = 1;

          const [programRes, programUpdateRes, enrollmentRes, instrumentRes, countryRes] = await Promise.all([
            backend.get("/program"),
            backend.get("/program-updates"),
            backend.get("/enrollmentChange"),
            backend.get("/instrument-changes"),
            backend.get("/country")
          ]);

          const programsData = Array.isArray(programRes.data) ? programRes.data : [];
          const programUpdates = Array.isArray(programUpdateRes.data) ? programUpdateRes.data : [];

          let enrollmentData = [];
          if (Array.isArray(enrollmentRes.data)) {
            enrollmentData = enrollmentRes.data;
          } else if (enrollmentRes.data && typeof enrollmentRes.data === 'object') {
            enrollmentData = [enrollmentRes.data];
          }

          const instrumentData = Array.isArray(instrumentRes.data) ? instrumentRes.data : [];
          const countryData = Array.isArray(countryRes.data) ? countryRes.data : [];

          const regionPrograms = programsData.filter((p) => {
            const country = countryData.find((c) => c.id === p.country);
            return country && country.regionId === regionId;
          });
          const programIds = regionPrograms.map((p) => p.id);

          const updateIds = programUpdates
            .filter((pu) => programIds.includes(Number(pu.programId)))
            .map((pu) => pu.id);

          const totalPrograms = regionPrograms.length;
          const totalStudents = enrollmentData
            .filter((e) => updateIds.includes(String(e.updateId)))
            .reduce((sum, e) => sum + (Number(e.enrollmentChange) || 0), 0);
          const totalInstruments = instrumentData
            .filter((i) => updateIds.includes(String(i.updateId)))
            .reduce((sum, i) => sum + (Number(i.amountChanged) || 0), 0);

          setStats([
            { label: "Programs", number: totalPrograms },
            { label: "Students", number: totalStudents },
            { label: "Instruments", number: totalInstruments },
          ]);
        }

        if (role === "pd") {
          const programId = 25;

          const [programUpdateRes, enrollmentRes, instrumentRes] = await Promise.all([
            backend.get("/program-updates"),
            backend.get("/enrollmentChange"),
            backend.get("/instrument-changes")
          ]);

          const programUpdates = Array.isArray(programUpdateRes.data) ? programUpdateRes.data : [];

          let enrollmentData = [];
          if (Array.isArray(enrollmentRes.data)) {
            enrollmentData = enrollmentRes.data;
          } else if (enrollmentRes.data && typeof enrollmentRes.data === 'object') {
            enrollmentData = [enrollmentRes.data];
          }

          const instrumentData = Array.isArray(instrumentRes.data) ? instrumentRes.data : [];
          const updateIds = programUpdates
            .filter((pu) => Number(pu.programId) === programId)
            .map((pu) => pu.id);

          const totalStudents = enrollmentData
            .filter((e) => updateIds.includes(String(e.updateId)))
            .reduce((sum, e) => sum + (Number(e.enrollmentChange) || 0), 0);
          const totalInstruments = instrumentData
            .filter((i) => updateIds.includes(String(i.updateId)))
            .reduce((sum, i) => sum + (Number(i.amountChanged) || 0), 0);

          setStats([
            { label: "Current Enrollment", number: totalStudents },
            { label: "Instruments Donated", number: totalInstruments },
          ]);
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
      }
    };

    fetchData();
  }, [role, backend]);

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
