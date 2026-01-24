import { DownloadIcon, HamburgerIcon, SearchIcon } from "@chakra-ui/icons";
import {
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

export const ProgramUpdatesTable = ({ programUpdatesData, gcfUserData }) => {
  const usersById = Object.fromEntries(gcfUserData.map((u) => [u.id, u]));
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
          <Heading> Updates</Heading>
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

        <TableContainer>
          <Table variant="simple">
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
              {programUpdatesData.map((row) => {
                return (
                  <Tr key={row.updateId}>
                    <Td>{row.updateDate}</Td>
                    <Td>{row.note}</Td>
                    <Td>{programsById[row.programId]?.name}</Td>
                    <Td>
                      {usersById[row.createdBy]?.firstName}{" "}
                      {usersById[row.createdBy]?.lastName}
                    </Td>
                    <Box
                      borderRadius="full"
                      bg="gray.200"
                      w="100px"
                      h="40px"
                      alignItems="center"
                      pb="50px"
                    >
                      <Td> {programsById[programId]?.status} </Td>
                    </Box>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};
