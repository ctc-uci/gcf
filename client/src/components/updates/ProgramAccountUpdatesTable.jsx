import {
  Flex,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export const ProgramAccountUpdatesTable = ({
  programData = [],
  gcfUserData = [],
  program = [],
}) => {
  const usersById = Object.fromEntries(gcfUserData.map((u) => [u.id, u]));
  const programsById = Object.fromEntries(program.map((p) => [p.id, p]));

  return (
    <>
      <Flex gap={10}>
        <Heading>Program & Account Updates</Heading>
        <Input
          variant="flushed"
          placeholder="Type to search"
          width="auto"
        />
      </Flex>
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
          {programData.map((row) => (
            <Tr>
              <Td>{row.updateDate}</Td>
              <Td>{row.note}</Td>
              <Td>{programsById[row.programId]?.name}</Td>
              <Td>
                {usersById[row.createdBy]?.firstName}{" "}
                {usersById[row.createdBy]?.lastName}
              </Td>
              <Td>{programsById[row.programId]?.status}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};
