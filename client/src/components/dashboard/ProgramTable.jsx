import { useEffect, useState } from "react";

import {
  AddIcon,
  DownloadIcon,
  HamburgerIcon,
  Search2Icon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Divider,
  HStack,
  IconButton,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineSquares2X2,
} from "react-icons/hi2";

import { ProgramForm } from "./ProgramForm";

const getRouteByRole = (role, userId) => {
  const routes = {
    Admin: "/admin/programs",
    "Regional Director": `/rdProgramTable/${userId}`,
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
  Admin: mapAdminRow,
  "Regional Director": mapRdRow,
};

function ProgramTable() {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role, loading: roleLoading } = useRoleContext();

  const { backend } = useBackendContext();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (roleLoading) return;

    const route = getRouteByRole(role, userId);
    const mapRow = MAP_BY_ROLE[role];

    console.log(route, mapRow);

    if (!route || !mapRow) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await backend.get(route);
        const rows = Array.isArray(res.data) ? res.data : [];
        setPrograms(rows.map(mapRow));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, roleLoading, userId, backend]);

  if (!getRouteByRole(role, userId) && !roleLoading) {
    return null;
  }

  return (
    <>
      <ProgramForm
        isOpen={isFormOpen}
        onOpen={() => setIsFormOpen(true)}
        onClose={() => setIsFormOpen(false)}
      />
      <TableContainer>
        <HStack
          mb={4}
          justifyContent="space-between"
          w="100%"
        >
          <HStack spacing={4}>
            <Box
              fontSize="xl"
              fontWeight="semibold"
            >
              All Programs
            </Box>
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
            <Divider
              orientation="vertical"
              h="20px"
            />
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
            <Button
              size="sm"
              rightIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
            >
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
            {isLoading ? (
              <Tr>
                <Td colSpan={7}>
                  <Center py={8}>
                    <Spinner size="lg" />
                  </Center>
                </Td>
              </Tr>
            ) : (
              programs.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.title}</Td>
                  <Td>{p.status}</Td>
                  <Td>{p.launchDate}</Td>
                  <Td>{p.location}</Td>
                  <Td>{p.students}</Td>
                  <Td>{p.instruments}</Td>
                  <Td>{p.totalInstruments}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}

export default ProgramTable;
