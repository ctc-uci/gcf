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

const getRouteByRole = (role, userId) => {
  const routes = {
    admin: "/admin/programs",
    regionalDirector: `/rdProgramTable/${userId}`,
  };
  return routes[role];
};

function mapAdminRow(row) {
  return {
    id: row.id,
    title: row.title ?? row.name,
    status: row.status,
    launchDate: row.launchDate,
    location: row.countryName ?? "",
    students: row.students ?? 0,
    instruments: row.instruments ?? 0,
    totalInstruments: row.instruments ?? 0,
  };
}

function mapRdRow(row) {
  return {
    id: row.programId,
    title: row.programName,
    status: row.programStatus,
    launchDate: row.programLaunchDate,
    location: row.programLocation ?? row.regionName ?? "",
    students: row.totalStudents ?? 0,
    instruments: row.totalInstruments ?? 0,
    totalInstruments: row.totalInstruments ?? 0,
  };
}

const MAP_BY_ROLE = {
  admin: mapAdminRow,
  regionalDirector: mapRdRow,
};

function ProgramTable({ role = "admin", userId }) {
  // TODO: remove prop and use AuthContext
  const { backend } = useBackendContext();
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const route = getRouteByRole(role, userId);
    const mapRow = MAP_BY_ROLE[role];

    if (!route || !mapRow) return;

    const fetchData = async () => {
      try {
        const res = await backend.get(route);
        const rows = Array.isArray(res.data) ? res.data : [];
        setPrograms(rows.map(mapRow));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [role, userId, backend]);

  if (!getRouteByRole(role, userId)) return null;

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
          {programs.map((p) => (
            <Tr key={p.id}>
              <Td>{p.title}</Td>
              <Td>{p.status}</Td>
              <Td>{p.launchDate}</Td>
              <Td>{p.location}</Td>
              <Td>{p.students}</Td>
              <Td>{p.instruments}</Td>
              <Td>{p.totalInstruments}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default ProgramTable;
