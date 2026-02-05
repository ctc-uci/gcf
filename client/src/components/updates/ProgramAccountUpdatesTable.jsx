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


export const ProgramAccountUpdatesTable = ({ data, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [unorderedUpdates, setUnorderedUpdates] = useState([]);

  const handleSearch = event => {
    setSearchQuery(event.target.value);
 };
 //setUnorderedUpdates(data.map((row) => row))
 useEffect(() => {
  setUnorderedUpdates(data);
 }, [searchQuery, data]);

  useEffect(() => {
     function filterUpdates(search) {
       // filter by search query
       console.log(unorderedUpdates);
       const filtered = unorderedUpdates.filter(update => 
         // if no search then show everything
         update.updateDate.toLowerCase().includes(search.toLowerCase()) ||
         update.note.toLowerCase().includes(search.toLowerCase()) ||
         update.name.toLowerCase().includes(search.toLowerCase()) ||
         update.firstName.toLowerCase().includes(search.toLowerCase()) ||
         update.lastName.includes(search.toLowerCase()) ||
         update.status.includes(search.toLowerCase())
       );
       if (search === '') {
         //setUpdates(unorderedUpdates);
         data = unorderedUpdates;
       } else {
         //setUpdates(filtered);
         data = filtered;
       }
     }
 
   filterUpdates(searchQuery);
 
   }, [searchQuery, unorderedUpdates]);


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
              <Tr>
                <Th>Time</Th>
                <Th>Notes</Th>
                <Th>Program</Th>
                <Th>Author</Th>
                <Th>Status</Th>
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
