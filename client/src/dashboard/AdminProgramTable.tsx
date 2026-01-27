import { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  TableContainer,
  IconButton,
  HStack,
  Box,
  Button,
  Divider,
} from "@chakra-ui/react";
import { Search2Icon, HamburgerIcon, DownloadIcon, AddIcon } from "@chakra-ui/icons";
import { HiOutlineAdjustmentsHorizontal, HiOutlineSquares2X2 } from "react-icons/hi2";
import { useBackendContext } from "@/contexts/hooks/useBackendContext"; 

interface Program {
  id: number;
  title: string;
  status: string;
  launchDate: string;
  country?: string;
  region?: string;
  students: number;
  amountChanged?: number;
  instruments?: number;
  totalInstruments?: number;
}

interface AdminProgramTableProps {
  role?: "admin" | "rd";
}

function AdminProgramTable({ role = "admin" }: AdminProgramTableProps) {
  const { backend } = useBackendContext();
  const [adminPrograms, setAdminPrograms] = useState<Program[]>([]);
  const [rdPrograms, setRdPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "admin") {
          const programsRes = await backend.get("/program");
          const enrollmentRes = await backend.get("/enrollmentChange");
          const countryRes = await backend.get("/country");
          const instrumentRes = await backend.get("/instrument-changes");

          const programsData = programsRes.data || [];

          // Handle enrollmentRes - backend returns single object wrapped, need to extract array
          let enrollmentData = [];
          if (Array.isArray(enrollmentRes.data)) {
            enrollmentData = enrollmentRes.data;
          } else if (enrollmentRes.data && typeof enrollmentRes.data === 'object') {
            enrollmentData = [enrollmentRes.data];
          }

          const countryData = countryRes.data || [];
          const instrumentData = instrumentRes.data || [];

          const enrollmentMap = enrollmentData.reduce((acc: any, e: any) => {
            if (!acc[e.programId]) {
              acc[e.programId] = 0;
            }
            acc[e.programId] += e.enrollmentChange || 0;
            return acc;
          }, {});

          const countryMap = Object.fromEntries(
            countryData.map((c: any) => [c.id, c.name])
          );

          const instrumentMap = instrumentData.reduce((acc: any, i: any) => {
            if (!acc[i.programId]) {
              acc[i.programId] = 0;
            }
            acc[i.programId] += i.amountChanged || 0;
            return acc;
          }, {});

          const merged = programsData.map((p: any) => ({
            ...p,
            students: enrollmentMap[p.id] || 0,
            country: countryMap[p.countryId] || "Unknown",
            instruments: instrumentMap[p.id] || 0,
            totalInstruments: instrumentMap[p.id] || 0,
          }));
          setAdminPrograms(merged);
        }

        if (role === "rd") {
          const regionId = 1;
          const programsRes = await backend.get("/program");
          const enrollmentRes = await backend.get("/enrollmentChange");
          const regionRes = await backend.get("/region");

          const programsData = programsRes.data || [];

          // Handle enrollmentRes - backend returns single object wrapped, need to extract array
          let enrollmentData = [];
          if (Array.isArray(enrollmentRes.data)) {
            enrollmentData = enrollmentRes.data;
          } else if (enrollmentRes.data && typeof enrollmentRes.data === 'object') {
            enrollmentData = [enrollmentRes.data];
          }

          const regionData = regionRes.data || [];

          const regionPrograms = programsData.filter(
            (p: any) => p.regionId === regionId
          );

          const enrollmentMap = enrollmentData.reduce((acc: any, e: any) => {
            if (!acc[e.programId]) {
              acc[e.programId] = 0;
            }
            acc[e.programId] += e.enrollmentChange || 0;
            return acc;
          }, {});

          const regionMap = Object.fromEntries(
            regionData.map((r: any) => [r.id, r.name])
          );

          const merged = regionPrograms.map((p: any) => ({
            ...p,
            students: enrollmentMap[p.id] || 0,
            region: regionMap[p.regionId] || "Unknown",
          }));
          setRdPrograms(merged);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [role, backend]);

  if (role === "admin") {
    return (
      <TableContainer>
        <HStack mb={4} justifyContent="space-between" w="100%">
          <HStack spacing={4}>
            <Box fontSize="xl" fontWeight="semibold">All Programs</Box>
            <HStack spacing={1}>
              <IconButton
                aria-label="search"
                icon={<Search2Icon />}
                size="sm"
                variant="ghost"
              />
              <Input
                w="120px"
                size="xs"
                placeholder="Type to search"
                variant="unstyled"
                borderBottom="1px solid"
                borderColor="gray.300"
                borderRadius="0"
                px={1}
              />
              <IconButton
                aria-label="filter"
                icon= {<HiOutlineAdjustmentsHorizontal />}
                size="sm"
                variant="ghost"
              />
            </HStack>
          </HStack>
          <HStack spacing={1}>
            <IconButton
              aria-label="menu"
              icon={<HamburgerIcon />}
              size="sm"
              variant="ghost"
            />
            <Divider orientation="vertical" h="20px" />
            <IconButton
              aria-label="search"
              icon={<HiOutlineSquares2X2 />}
              size="sm"
              variant="ghost"
            />
            <IconButton
              aria-label="download"
              icon={<DownloadIcon />}
              size="sm"
              variant="ghost"
              ml={2}
            />
            <Button size="sm" rightIcon={<AddIcon />}>
              New
            </Button>
          </HStack>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Program</Th>
              <Th>Status</Th>
              <Th>Launch Date</Th>
              <Th>Location</Th>
              <Th>Students</Th>
              <Th>Instruments</Th>
              <Th>Total Instruments</Th>
            </Tr>
          </Thead>
          <Tbody>
            {adminPrograms?.map((p) => (
              <Tr key={p.id}>
                <Td>{p.title}</Td>
                <Td>{p.status}</Td>
                <Td>{p.launchDate}</Td>
                <Td>{p.country}</Td>
                <Td>{p.students}</Td>
                <Td>{p.amountChanged}</Td>
                <Td>{p.totalInstruments}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    );
  }

  if (role === "rd") {
    return (
      <TableContainer>
        <HStack mb={4} justifyContent="space-between" w="100%">
          <HStack spacing={4}>
            <Box fontSize="xl" fontWeight="semibold">All Programs</Box>
            <HStack spacing={1}>
              <IconButton
                aria-label="search"
                icon={<Search2Icon />}
                size="sm"
                variant="ghost"
              />
              <Input
                w="120px"
                size="xs"
                placeholder="Type to search"
                variant="unstyled"
                borderBottom="1px solid"
                borderColor="gray.300"
                borderRadius="0"
                px={1}
              />
              <IconButton
                aria-label="filter"
                icon={<HiOutlineAdjustmentsHorizontal />}
                size="sm"
                variant="ghost"
              />
            </HStack>
          </HStack>
          <HStack spacing={1}>
            <IconButton
              aria-label="menu"
              icon={<HamburgerIcon />}
              size="sm"
              variant="ghost"
            />
            <Divider orientation="vertical" h="20px" />
            <IconButton
              aria-label="search"
              icon={<HiOutlineSquares2X2 />}
              size="sm"
              variant="ghost"
            />
            <IconButton
              aria-label="download"
              icon={<DownloadIcon />}
              size="sm"
              variant="ghost"
              ml={2}
            />
            <Button size="sm" rightIcon={<AddIcon />}>
              New
            </Button>
          </HStack>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Program</Th>
              <Th>Status</Th>
              <Th>Launch Date</Th>
              <Th>Location</Th>
              <Th>Students</Th>
              <Th>Instruments</Th>
              <Th>Total Instruments</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rdPrograms?.map((r) => (
              <Tr key={r.id}>
                <Td>{r.title}</Td>
                <Td>{r.status}</Td>
                <Td>{r.launchDate}</Td>
                <Td>{r.region}</Td>
                <Td>{r.students}</Td>
                <Td>{r.instruments}</Td>
                <Td>{r.totalInstruments}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    );
  }

  return null;
}

export default AdminProgramTable;
