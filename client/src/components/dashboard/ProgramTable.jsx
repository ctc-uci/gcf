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

// enum and map for sorting cycles 
const sortCycle = Object.freeze({
  "ASCENDING": "DESCENDING",
  "DESCENDING": "UNSORTED",
  "UNSORTED": "ASCENDING",
});

// TODO(login): Replace role prop with useRoleContext() or AuthContext; replace userId prop with AuthContext (currentUser?.uid).
function ProgramTable({ role = "admin", userId }) {
  const { backend } = useBackendContext();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [unorderedPrograms, setUnorderedPrograms] = useState([]); // store a copy of the original unorderd programs 
  const [sortOrder, setSortOrder] = useState({ "currentSortColumn": null, "prevSortColumn": {} }); 
  // tracks current and previous sort orders for each column
  // need to track previous sort order for each column to implement sort cycle correctly
    /* sortOrder structure:
      {
        currentSortColumn: 'title' | 'status' | 'launchDate' | 'location' | 'students' | 'instruments' | 'totalInstruments',
        prevSortColumn: {
          "program": sortCycle.ASCENDING | sortCycle.DESCENDING | sortCycle.UNSORTED,
          "status": sortCycle.ASCENDING | sortCycle.DESCENDING | sortCycle.UNSORTED,
          ...
        }
      }
    */
  //const [filteredData, setFilteredData] = useState(programs);
  const [searchQuery, setSearchQuery] = useState("");  

// set search query as value entered in search bar
 const handleSearch = event => {
    setSearchQuery(event.target.value);
    //filterPrograms(searchQuery);
 };

 useEffect(() => {
    function filterPrograms(search) {
      // filter by search query
      console.log(unorderedPrograms);
      const filtered = unorderedPrograms.filter(program => 
        // if no search then show everything
        program.title.toLowerCase().includes(search.toLowerCase()) ||
        program.status.toLowerCase().includes(search.toLowerCase()) ||
        program.launchDate.toLowerCase().includes(search.toLowerCase()) ||
        program.location.toLowerCase().includes(search.toLowerCase()) ||
        program.students.includes(search.toLowerCase()) ||
        program.instruments.includes(search.toLowerCase()) ||
        program.totalInstruments.includes(search.toLowerCase())
      );
      if (search === '') {
        setPrograms(unorderedPrograms);
      } else {
        setPrograms(filtered);
      }
    }

  filterPrograms(searchQuery);

  }, [searchQuery, unorderedPrograms]);

  function updatePrevSortColumn(sortOrderCopy, column) {
    // toggle between asc and desc when sorting by a specific column
    // prevSortColumn object doesn't have the keys of all headers initially so need to check if it exists
    if (Object.hasOwn(sortOrderCopy["prevSortColumn"], column)) {
      const newSortOrder = sortCycle[sortOrderCopy["prevSortColumn"][column]];
      sortOrderCopy["prevSortColumn"][column] = newSortOrder;
      return newSortOrder;
    } else {
      sortOrderCopy["prevSortColumn"][column] = sortCycle.ASCENDING; // default is ASCENDING
      return sortCycle.ASCENDING;
    }
  }

  function handleSort(column) {
    const sortOrderCopy = { ...sortOrder };
    sortOrderCopy["currentSortColumn"] = column;
    const newSortOrder = updatePrevSortColumn(sortOrderCopy, column);
    setSortOrder(sortOrderCopy);

    if (newSortOrder === sortCycle.UNSORTED) {
      setPrograms(unorderedPrograms);
      return;
    }

    // sort programs array
    const sortedPrograms = [...programs].sort((a, b) => {
      if (sortOrderCopy["prevSortColumn"][column] === sortCycle.ASCENDING) {
        return a[column].localeCompare(b[column]); 
      } else {
        return b[column].localeCompare(a[column]);
      }
    }) 

    setPrograms(sortedPrograms);
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
        console.log("rows: ", rows);
        setPrograms(rows.map(mapRow));
        setUnorderedPrograms(rows.map(mapRow)); //
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
