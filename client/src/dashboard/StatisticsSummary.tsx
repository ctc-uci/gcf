import { useEffect, useState } from "react";

import { Box, Heading, HStack, IconButton, VStack } from "@chakra-ui/react";

import { MdOutlineFileDownload } from "react-icons/md";

const StatBox = ({ label, number }: { label: string; number: number }) => {
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

interface StatisticsSummaryProps {
  role?: "admin" | "rd" | "pd";
}

const StatisticsSummary = ({ role = "admin" }: StatisticsSummaryProps) => {
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
        const fetchJson = async (url: string) => {
          const res = await fetch(url);
          const text = await res.text();
          if (!text) return [];
          try {
            return JSON.parse(text);
          } catch (err) {
            console.error(`Invalid JSON from ${url}:`, text, err);
            return [];
          }
        };

        if (role === "admin") {
          const programsData = await fetchJson("http://localhost:3001/program");
          const enrollmentData = await fetchJson(
            "http://localhost:3001/enrollmentChange"
          );
          const instrumentData = await fetchJson(
            "http://localhost:3001/instrument-change"
          );

          const totalPrograms = programsData.length;
          const totalStudents = enrollmentData.reduce(
            (sum: number, e: any) => sum + (e.enrollmentChange || 0),
            0
          );
          const totalInstruments = instrumentData.reduce(
            (sum: number, i: any) => sum + (i.amountChanged || 0),
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
          const enrollmentData = await fetchJson(
            "http://localhost:3001/enrollmentChange"
          );
          const instrumentData = await fetchJson(
            "http://localhost:3001/instrument-change"
          );
          const regionData = await fetchJson("http://localhost:3001/region");

          const regionPrograms = regionData.filter(
            (r: any) => r.id === regionId
          );
          const programIds = regionPrograms.map((r: any) => r.id);

          const totalPrograms = regionPrograms.length;
          const totalStudents = enrollmentData
            .filter((e: any) => programIds.includes(e.programId))
            .reduce(
              (sum: number, e: any) => sum + (e.enrollmentChange || 0),
              0
            );
          const totalInstruments = instrumentData
            .filter((i: any) => programIds.includes(i.programId))
            .reduce((sum: number, i: any) => sum + (i.amountChanged || 0), 0);

          setStats([
            { label: "Programs", number: totalPrograms },
            { label: "Students", number: totalStudents },
            { label: "Instruments", number: totalInstruments },
          ]);
        }

        if (role === "pd") {
          const programId = 1;

          const enrollmentData = await fetchJson(
            "http://localhost:3001/enrollmentChange"
          );
          const instrumentData = await fetchJson(
            "http://localhost:3001/instrument-change"
          );
          const totalStudents = enrollmentData
            .filter((e: any) => e.programId === programId)
            .reduce(
              (sum: number, e: any) => sum + (e.enrollmentChange || 0),
              0
            );
          const totalInstruments = instrumentData
            .filter((i: any) => i.programId === programId)
            .reduce((sum: number, i: any) => sum + (i.amountChanged || 0), 0);

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
  }, [role]);

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
