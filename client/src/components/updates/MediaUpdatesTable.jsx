// import { useEffect } from "react";

import {
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
      <Flex gap={10}>
        <Heading> Media Updates </Heading>
        <Input
          placeholder="Type to search"
          variant="flushed"
          w="200px"
        />
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
          <Tbody></Tbody>
        </Table>
      </TableContainer>
    </>
  );
};
