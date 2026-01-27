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
  const [adminPrograms, setAdminPrograms] = useState<Program[]>([]);
  const [rdPrograms, setRdPrograms] = useState<Program[]>([]);

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
          const countryData = await fetchJson("http://localhost:3001/country");
          const instrumentData = await fetchJson(
            "http://localhost:3001/instrument-change"
          );

          const enrollmentMap = Object.fromEntries(
            enrollmentData.map((e: any) => [e.id, e])
          );

          const countryMap = Object.fromEntries(
            countryData.map((c: any) => [c.id, c])
          );

          const instrumentMap = Object.fromEntries(
            instrumentData.map((i: any) => [i.id, i])
          );

          const merged = programsData.map((p: any) => {
            const enrollmentInfo = enrollmentMap[p.id] || {};
            const countryInfo = countryMap[p.id] || {};
            const instrumentInfo = instrumentMap[p.id] || {};

            return {
              ...p,
              students: enrollmentInfo?.enrollmentChange ?? 0,
              country: countryInfo?.name ?? "Unknown",
              instruments: instrumentInfo?.amountChanged ?? 0,
            };
          });
          setAdminPrograms(merged);
        }

        if (role === "rd") {
          const programsData = await fetchJson("http://localhost:3001/program");
          const enrollmentData = await fetchJson(
            "http://localhost:3001/enrollmentChange"
          );
          const regionData = await fetchJson("http://localhost:3001/region");

          const enrollmentMap = Object.fromEntries(
            enrollmentData.map((e: any) => [e.id, e])
          );

          const programsMap = Object.fromEntries(
            programsData.map((p: any) => [p.id, p])
          );

          const merged = regionData.map((r: any) => {
            const enrollmentInfo = enrollmentMap[r.id] || {};
            const programInfo = programsMap[r.id] || {};

            return {
              ...r,
              students: enrollmentInfo?.enrollmentChange ?? 0,
              title: programInfo?.title ?? "Unknown",
              launchDate: programInfo?.launchDate ?? 0,
              status: programInfo?.status ?? "Unknown",
            };
          });
          setRdPrograms(merged);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [role]);

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
