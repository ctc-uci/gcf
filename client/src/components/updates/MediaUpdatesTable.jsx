// import { useEffect } from "react";

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

export const MediaUpdatesTable = ({
  mediaUpdatesData,
  programUpdatesData,
  programData,
  gcfUserData,
}) => {
  const usersById = Object.fromEntries(gcfUserData.map((u) => [u.id, u]));
  const programsById = Object.fromEntries(programData.map((p) => [p.id, p]));
  const programUpdatesById = Object.fromEntries(
    programUpdatesData.map((p) => [p.id, p])
  );

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

        <TableContainer>
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
              {mediaUpdatesData.map((row) => {
                const programId = programUpdatesById[row.updateId]?.programId;
                const userId = programUpdatesById[row.updateId]?.createdBy;
                return (
                  <Tr key={row.updateId}>
                    <Td> {programUpdatesById[row.updateId]?.updateDate} </Td>
                    <Td> {programUpdatesById[row.updateId]?.note} </Td>
                    <Td>{programsById[programId]?.title}</Td>
                    <Td>
                      {usersById[userId].firstName} {usersById[userId].lastName}
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
