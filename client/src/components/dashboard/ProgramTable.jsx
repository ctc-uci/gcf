import { useEffect, useState } from "react";
import {
  AddIcon,
  DownloadIcon,
  EditIcon,
  HamburgerIcon,
  Search2Icon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Collapse,
  useDisclosure,
  VStack,
  Link,
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
import { HiOutlineAdjustmentsHorizontal, HiOutlineSquares2X2 } from "react-icons/hi2";
import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useRoleContext } from "@/contexts/hooks/useRoleContext";
import { useTableSort } from "../../contexts/hooks/TableSort";
import { SortArrows } from "../tables/SortArrows";
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
    country: row.country,


    students: row.students ?? 0,
    instruments: row.instruments ?? 0,
    totalInstruments: row.instruments ?? 0,

    programDirectors: row.programDirectors,
    regionalDirectors: row.regionalDirectors,

    playlists: row.playlists,
    primaryLanguage: row.primaryLanguage,
  };
}

function mapRdRow(row) {
  return {
    id: row.programId,
    title: row.programName,
    status: row.programStatus,
    launchDate: row.programLaunchDate,

    location: row.programLocation ?? row.regionName ?? "",
    countryId: row.countryId,
    regionId: row.regionId,

    students: row.totalStudents ?? 0,
    instruments: row.totalInstruments ?? 0,
    totalInstruments: row.totalInstruments ?? 0,
    programDirectors: row.programDirectors,
    regionalDirectors: row.regionalDirectors,

    playlists: row.playlists,
    primaryLanguage: row.primaryLanguage,
  };
}

const MAP_BY_ROLE = {
  Admin: mapAdminRow,
  "Regional Director": mapRdRow,
};

function ExpandableRow({ p, onEdit }) {
  const { isOpen, onToggle } = useDisclosure();
  return (
    <>
      <Tr onClick={onToggle} cursor="pointer" sx={{ td: { borderBottom: isOpen ? "none" : undefined } }}>
        <Td>{p.title}</Td>
        <Td>{p.status}</Td>
        <Td>{p.launchDate}</Td>
        <Td>{p.location}</Td>
        <Td>{p.students}</Td>
        <Td>{p.instruments}</Td>
        <Td>{p.totalInstruments}</Td>
      </Tr>
      <Tr>
        <Td colSpan={7} borderBottom={isOpen ? "1px solid" : "none"} borderColor="gray.200" p={isOpen ? undefined : 0}>
          <Collapse in={isOpen}>
            <Box position="relative">
              <HStack align="start">
                <Box flex="1" display="grid">
                  <Box fontSize="sm" fontWeight="semibold" pb="2">Language:</Box>
                  <Box>{p.primaryLanguage ?? "-"}</Box>
                </Box>
                <Box flex="1" display="grid">
                  <Box fontSize="sm" fontWeight="semibold" pb="2">Regional Director(s)</Box>
                  <Box>
                    <VStack align="start" spacing={2}>
                      {Array.isArray(p.regionalDirectors)
                        ? p.regionalDirectors.map((d, idx) => (
                          <Box
                            key={d.userId ?? `${d.firstName}-${d.lastName}-${idx}`}
                            bg="gray.200"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {d.firstName} {d.lastName}
                          </Box>
                        ))
                        : null}
                    </VStack>
                  </Box>
                </Box>
                <Box flex="1" display="grid">
                  <Box fontSize="sm" fontWeight="semibold" pb="2">Program Director(s)</Box>
                  <Box>
                    <VStack align="start" spacing={2}>
                      {Array.isArray(p.programDirectors)
                        ? p.programDirectors.map((d, idx) => (
                          <Box
                            key={d.userId ?? `${d.firstName}-${d.lastName}-${idx}`}
                            bg="gray.200"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {d.firstName} {d.lastName}
                          </Box>
                        ))
                        : null}
                    </VStack>
                  </Box>
                </Box>
                <Box flex="1" display="grid">
                  <Box fontSize="sm" fontWeight="semibold" pb="2">Curriculum Link(s)</Box>
                  <Box>
                    {Array.isArray(p.playlists) ? p.playlists.map((l) => {
                      return <Box key={l.link}><Link href={l.link} color="blue">{l.name}</Link></Box>
                    }) : null}
                  </Box>
                </Box>
              </HStack>
              <Button size="xs"
                position="absolute"
                bottom="8px"
                right="8px"
                border="1px solid"
                bg="white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(p);
                }}
                leftIcon={<EditIcon />}
              >Update</Button>
            </Box>
          </Collapse>
        </Td>
      </Tr>
    </>
  )
}


function ProgramDisplay({
  data,
  setData,
  originalData,
  searchQuery,
  setSearchQuery,
  isLoading,
  role,
  userId,
  openEditForm,
  isFormOpen,
  setIsFormOpen,
  selectedProgram,
  setSelectedProgram
}) {
  const { sortOrder, handleSort } = useTableSort(originalData, setData);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    if (!originalData || originalData.length === 0) return;

    if (searchQuery === "") {
      setData(originalData);
      return;
    }

    const filtered = originalData.filter(
      (program) =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.launchDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(program.students)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(program.instruments)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(program.totalInstruments)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setData(filtered);
  }, [searchQuery, originalData]);
  
  if (!getRouteByRole(role, userId)) return null;

  return (
    <>
    <ProgramForm
      isOpen={isFormOpen}
      onOpen={() => setIsFormOpen(true)}
      onClose={() => {
        setIsFormOpen(false);
        setSelectedProgram(null);
      }}
      program={selectedProgram}
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
              aria-label="filter"
              icon={<HiOutlineAdjustmentsHorizontal />}
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
            <Button size="sm" rightIcon={<AddIcon />} onClick={() => {
              setSelectedProgram(null);
              setIsFormOpen(true);
            }}>
              New
            </Button>
          </HStack>
        </HStack>


      <Table variant="simple" aria-label="collapsible-table">
        <Thead>
          <Tr>
            <Th
              onClick={() => handleSort("title")}
              cursor="pointer"
            >
              Program{" "}
              <SortArrows
                columnKey="title"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("status")}
              cursor="pointer"
            >
              Status{" "}
              <SortArrows
                columnKey="status"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("launchDate")}
              cursor="pointer"
            >
              Launch Date{" "}
              <SortArrows
                columnKey="launchDate"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("location")}
              cursor="pointer"
            >
              Location{" "}
              <SortArrows
                columnKey="location"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("students")}
              cursor="pointer"
            >
              Students{" "}
              <SortArrows
                columnKey="students"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("instruments")}
              cursor="pointer"
            >
              Instruments{" "}
              <SortArrows
                columnKey="instruments"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("totalInstruments")}
              cursor="pointer"
            >
              Total Instruments{" "}
              <SortArrows
                columnKey="totalInstruments"
                sortOrder={sortOrder}
              />
            </Th>
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
              <ExpandableRow key={p.id} p={p} onEdit={openEditForm} />
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
    </>
  );
}




function ProgramTable() {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role, loading: roleLoading } = useRoleContext();

  const { backend } = useBackendContext();
  const [programs, setPrograms] = useState([]);
  const [originalPrograms, setOriginalPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const openEditForm = (program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  }

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
        console.log(res.data);
        const rows = Array.isArray(res.data) ? res.data : [];
        const mapped = rows.map(mapRow);
        const programDetails = await Promise.all(
          rows.map(async (row) => { //TODO: make this more efficient with lazy loading
            const [playlists, programDirectors, regionalDirectors] = await Promise.all([
              backend.get(`/program/${row.id}/playlists`),
              backend.get(`/program/${row.id}/program-directors`).catch(() => ({ data: [] })),
              backend.get(`/program/${row.id}/regional-directors`).catch(() => ({ data: [] })),
            ]);

            return {
              ...row,
              playlists: playlists.data,
              programDirectors: programDirectors?.data || [],
              regionalDirectors: regionalDirectors?.data || [],
            };
          })
        );
        setOriginalPrograms(programDetails);
        setPrograms(programDetails);
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
    <ProgramDisplay
      data={programs}
      setData={setPrograms}
      originalData={originalPrograms}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isLoading={isLoading}
      role={role}
      userId={userId}
      openEditForm={openEditForm}
      isFormOpen={isFormOpen}
      setIsFormOpen={setIsFormOpen}
      selectedProgram={selectedProgram}
      setSelectedProgram={setSelectedProgram}
    />
  );
}

export default ProgramTable;
