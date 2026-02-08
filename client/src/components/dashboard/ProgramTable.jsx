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
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Search2Icon, HamburgerIcon, DownloadIcon, AddIcon } from "@chakra-ui/icons";
import { HiOutlineAdjustmentsHorizontal, HiOutlineSquares2X2 } from "react-icons/hi2";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useTableSort } from "../../contexts/hooks/TableSort";
import { ProgramForm } from "./ProgramForm";

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

function ProgramDisplay({ data, setData, originalData, searchQuery, setSearchQuery, isLoading }) {
  const { sortOrder, handleSort } = useTableSort(originalData, setData);

  const handleSearch = event => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    if (!originalData || originalData.length === 0) return;

    if (searchQuery === '') {
      setData(originalData);
      return;
    }

    const filtered = originalData.filter(program =>
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.launchDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(program.students).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(program.instruments).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(program.totalInstruments).toLowerCase().includes(searchQuery.toLowerCase())
    );
    setData(filtered);
  }, [searchQuery, originalData]);

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
                value={searchQuery}
                onChange={handleSearch}
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
            <Button size="sm" rightIcon={<AddIcon />} onClick={() => setIsFormOpen(true)}>
              New
            </Button>
          </HStack>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th><Button variant="ghost" onClick={() => handleSort("title")}>Program</Button></Th>
              <Th><Button variant="ghost" onClick={() => handleSort("status")}>Status</Button></Th>
              <Th><Button variant="ghost" onClick={() => handleSort("launchDate")}>Launch Date</Button></Th>
              <Th><Button variant="ghost" onClick={() => handleSort("location")}>Location</Button></Th>
              <Th><Button variant="ghost" onClick={() => handleSort("students")}>Students</Button></Th>
              <Th><Button variant="ghost" onClick={() => handleSort("instruments")}>Instruments</Button></Th>
              <Th><Button variant="ghost" onClick={() => handleSort("totalInstruments")}>Total Instruments</Button></Th>
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
              data.map((p) => (
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
  );

}

// TODO(login): Replace role prop with useRoleContext() or AuthContext; replace userId prop with AuthContext (currentUser?.uid).
function ProgramTable({ role = "admin", userId }) {
  const { backend } = useBackendContext();
  const [programs, setPrograms] = useState([]);
  const [originalPrograms, setOriginalPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");  

  useEffect(() => {
    const route = getRouteByRole(role, userId);
    const mapRow = MAP_BY_ROLE[role];

    if (!route || !mapRow) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await backend.get(route);
        const rows = Array.isArray(res.data) ? res.data : [];
        const mapped = rows.map(mapRow);
        setOriginalPrograms(mapped);
        setPrograms(mapped);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, userId, backend]);

  if (!getRouteByRole(role, userId)) return null;

  return (
    <>
    <ProgramForm
      isOpen={isFormOpen}
      onOpen={() => setIsFormOpen(true)}
      onClose={() => setIsFormOpen(false)}
    />
    <ProgramDisplay data={programs} setData={setPrograms} originalData={originalPrograms} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isLoading={isLoading}/>
    </>
  );
}

export default ProgramTable;
