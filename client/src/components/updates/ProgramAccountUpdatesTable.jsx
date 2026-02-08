import { DownloadIcon, HamburgerIcon, SearchIcon } from "@chakra-ui/icons";
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
} from "@chakra-ui/react";
import { useTableSort } from "../../contexts/hooks/TableSort";

export const ProgramAccountUpdatesTable = ({ data, setData, originalData, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { sortOrder, handleSort } = useTableSort(originalData, setData);

  const handleSearch = event => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
     function filterUpdates(search) {
      if (search === '') {
        setData(originalData);
        return;
       }
       // filter by search query
       const filtered = originalData.filter(update => 
         // if no search then show everything
         update.updateDate.toLowerCase().includes(search.toLowerCase()) ||
         update.note.toLowerCase().includes(search.toLowerCase()) ||
         update.name.toLowerCase().includes(search.toLowerCase()) ||
         update.firstName.toLowerCase().includes(search.toLowerCase()) ||
         update.lastName.toLowerCase().includes(search.toLowerCase()) ||
         update.status.toLowerCase().includes(search.toLowerCase())
       );
       
        setData(filtered);
     }
 
   filterUpdates(searchQuery);
 
   }, [searchQuery, originalData]);


  return (
    <>
      <Box
        mt="30px"
        ml="10px"
      >
        <Flex
          gap={10}
          mb="20px"
        >
          <Heading>Program & Account Updates</Heading>
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
          <HamburgerIcon mt="10px" />
          <DownloadIcon mt="10px" />
        </Flex>
        <TableContainer
          overflowX="auto"
          maxW="100%"
        >
          <Table>
            <Thead>
              {/* { TODO: implement interface for row data to avoid hardcoding keys in handleSort call } */}
              <Tr>
                <Th onClick={() => handleSort('updateDate')} cursor="pointer">Time</Th>
                <Th onClick={() => handleSort('note')} cursor="pointer">Notes</Th>
                <Th onClick={() => handleSort('name')} cursor="pointer">Program</Th>
                <Th onClick={() => handleSort('firstName')} cursor="pointer">Author</Th>
                <Th onClick={() => handleSort('status')} cursor="pointer">Status</Th>
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
                    <Td>{row.name}</Td>
                    <Td>
                      {row.firstName} {row.lastName}
                    </Td>
                    <Td>
                      <Badge>{row.status}</Badge>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};
