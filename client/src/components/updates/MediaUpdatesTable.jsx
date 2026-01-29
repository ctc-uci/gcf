import { DownloadIcon, HamburgerIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export const MediaUpdatesTable = ({ data }) => {
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
          <Heading> Media Updates </Heading>
          <SearchIcon
            mt="10px"
            ml="10px"
          />
          <Input
            placeholder="Type to search"
            variant="flushed"
            w="200px"
          />
          <HamburgerIcon mt="10px" />
          <DownloadIcon mt="10px" />
        </Flex>

        <TableContainer overflowX="auto" maxW="100%">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th> Time </Th>
                <Th> Notes </Th>
                <Th> Program </Th>
                <Th> Author </Th>
                <Th> Status </Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((row) => (
                <Tr key={row.row_id}>
                  <Td> {row.updateDate} </Td>
                  <Td> {row.note} </Td>
                  <Td>{row.name}</Td>
                  <Td>
                    {row.firstName} {row.lastName}
                  </Td>
                  <Td>
                    <Badge> {row.status} </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};
