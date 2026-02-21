import { DownloadIcon, SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Center,
  Flex,
  Heading,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Popover,
  PopoverContent,
  PopoverTrigger,
  IconButton,
  Text
} from "@chakra-ui/react";
import {
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";
import { SortArrows } from "../tables/SortArrows"
import { useTableSort } from "../../contexts/hooks/TableSort";
import { useTableFilter } from "../../contexts/hooks/TableFilter"
import { FilterComponent } from "../common/FilterComponent";

export const MediaUpdatesTable = ({ data, setData, originalData, isLoading }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [unorderedUpdates, setUnorderedUpdates] = useState([]);
    const { sortOrder, handleSort } = useTableSort(originalData, setData);
    const columns = [
    {
      key: "updateDate",
      type: "date",
    },
    {
      key: "note",
      type: "text",
    },
    {
      key: "programName",
      type: "text",
    },
    {
      key: "firstName",
      type: "text",
    },
    {
      key: "status",
      type: "select",
      options: ["Active", "Inactive"],
    },
  ];
  const  [activeFilters, setActiveFilters] = useState([]);
  const filteredData = useTableFilter(activeFilters, originalData);
  
  useEffect(() => {
    setData(filteredData);
  }, [filteredData, setData]);
  
    const handleSearch = event => {
      setSearchQuery(event.target.value);
   };
   useEffect(() => {
    setUnorderedUpdates(data);
   }, [searchQuery, data]);
  
    useEffect(() => {
       function filterUpdates(search) {
        if (search === '') {
          setData(originalData);
          return;
         }
         // filter by search query
         const filtered = unorderedUpdates.filter(update => 
           // if no search then show everything
           update.updateDate.toLowerCase().includes(search.toLowerCase()) ||
           update.note.toLowerCase().includes(search.toLowerCase()) ||
           update.firstName.toLowerCase().includes(search.toLowerCase()) ||
           update.status.includes(search.toLowerCase())
         );        
        setData(filtered);
        
       }
  
     filterUpdates(searchQuery);
     }, [searchQuery, originalData]);

  return (
    <Box
      mt="30px"
      ml="10px"
    >
      <Flex
        gap={10}
        mb="20px"
      >
        <Heading>Media Updates</Heading>
        <SearchIcon
          mt="10px"
          ml="10px"
        />
        <Input
          placeholder="Type to search"
          variant="flushed"
          w="200px"
          value={searchQuery}
          onChange={handleSearch}
        />
        <Popover>
          <PopoverTrigger>
            <IconButton
              aria-label="filter"
              icon={<HiOutlineAdjustmentsHorizontal />}
              size="sm"
              variant="ghost"
            />
          </PopoverTrigger>
          <PopoverContent
            w="800px"
            maxW="90vw"
            shadow="xl"
          >
            <FilterComponent
              columns={columns}
              onFilterChange={(filters) => {
                setActiveFilters(filters);
              }}
            />
          </PopoverContent>
        </Popover>
        <Text fontSize="sm" color="gray.500">
          Displaying {data.length} results
        </Text>
        <DownloadIcon mt="10px" />
      </Flex>

      <TableContainer
        overflowX="auto"
        maxW="100%"
      >
        <Table variant="simple">
          <Thead>
            {/* { TODO: implement interface for row data to avoid hardcoding keys in handleSort call } */}
            <Tr>
              <Th onClick={() => handleSort('updateDate')} cursor="pointer">Time <SortArrows columnKey={"updateDate"} sortOrder={sortOrder}/> </Th>
              <Th onClick={() => handleSort('note')} cursor="pointer">Notes <SortArrows columnKey={"note"} sortOrder={sortOrder}/> </Th>
              <Th onClick={() => handleSort('programName')} cursor="pointer">Program <SortArrows columnKey={"programName"} sortOrder={sortOrder}/> </Th>
              <Th onClick={() => handleSort('firstName')} cursor="pointer">Author <SortArrows columnKey={"firstName"} sortOrder={sortOrder}/> </Th>
              <Th onClick={() => handleSort('status')} cursor="pointer">Status <SortArrows columnKey={"status"} sortOrder={sortOrder}/> </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={5}>
                  <Center py={8}>
                    <Spinner size="lg" />
                  </Center>
                </Td>
              </Tr>
            ) : (
              data.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.updateDate}</Td>
                  <Td>{row.note}</Td>
                  <Td>{row.programName}</Td>
                  <Td>
                    {row.firstName} {row.lastName}
                  </Td>
                  <Td>
                    <Badge> {row.status} </Badge>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
