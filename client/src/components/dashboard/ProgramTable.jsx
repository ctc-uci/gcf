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
  Collapse,
  useDisclosure,
  VStack,
  Link
} from "@chakra-ui/react";

import { Search2Icon, HamburgerIcon, DownloadIcon, AddIcon, EditIcon } from "@chakra-ui/icons";
import { HiOutlineAdjustmentsHorizontal, HiOutlineSquares2X2 } from "react-icons/hi2";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";
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
  admin: mapAdminRow,
  regionalDirector: mapRdRow,
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
                {Array.isArray(p.regionalDirectors) ? p.regionalDirectors.map((d)=> {
                  return <Box key = {d.userId}
                      bg="gray.200"
                      px={3}
                      py={1}
                      borderRadius="full">{d.firstName} {d.lastName}</Box>
                }) : null}
              </VStack>
              </Box>
            </Box>
            <Box flex="1" display="grid">
              <Box fontSize="sm" fontWeight="semibold" pb="2">Program Director(s)</Box>
              <Box>
                <VStack align="start" spacing={2}>
                  {Array.isArray(p.programDirectors) ? p.programDirectors.map((d)=> {
                  return <Box key = {d.userId}
                      bg="gray.200"
                      px={3}
                      py={1}
                      borderRadius="full">{d.firstName} {d.lastName}</Box>
                }) : null}
              </VStack>
              </Box>
            </Box> 
            <Box flex="1" display="grid">
              <Box fontSize="sm" fontWeight="semibold" pb="2">Curriculum Link(s)</Box>
              <Box>
                {Array.isArray(p.playlists) ? p.playlists.map((l)=> {
                return <Box><Link href={l.link} color="blue">Instrument | {p.primaryLanguage ?? "-"}</Link></Box>
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

// TODO(login): Replace role prop with useRoleContext() or AuthContext; replace userId prop with AuthContext (currentUser?.uid).
function ProgramTable({ role = "admin", userId }) {
  const { backend } = useBackendContext();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const openEditForm = (program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  }


  useEffect(() => {
    const route = getRouteByRole(role, userId);
    const mapRow = MAP_BY_ROLE[role];

    if (!route || !mapRow) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await backend.get(route);
        const rows = Array.isArray(res.data) ? res.data : [];

        // fetches the rds, pds, curriculum(playlists) per program
        const programDetails = await Promise.all(
          rows.map(async (row) => {
            const [ playlists, programDirectors, regionalDirectors] = await Promise.all([
              backend.get(`/program/${row.id}/playlists`),
              backend.get(`/program/${row.id}/program-directors`).catch(() => ({ data: [] })),
              backend.get(`/program/${row.id}/regional-directors`).catch(() => ({ data: [] })),

            ]);
            
            //console.log("[RAW ROW],", row);
            return {
              ...row,
              playlists: playlists.data,
              programDirectors: programDirectors?.data || [],
              regionalDirectors: regionalDirectors?.data || [],
            }; 
          })
        );

        
        setPrograms(programDetails.map(mapRow));
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
      onClose={() => {
        setIsFormOpen(false);
        setSelectedProgram(null);
      }}
      program={selectedProgram}

    />
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
              <ExpandableRow key={p.id} p={p} onEdit={openEditForm}/>
            ))
          )}
          <Tr>

          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
    </>
  );
}

export default ProgramTable;
