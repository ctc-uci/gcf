import {
  Flex,
  Heading,
  Input,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export const ProgramAccountUpdatesTable = ({ programData }) => {
  return (
    <>
      <Flex>
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
          {/** {programData.map((row) => (
            <Tr>
              <Td>{row.time}</Td>
              <Td>{row.notes}</Td>
              <Td>{row.program}</Td>
              <Td>{row.author}</Td>
              <Td>{row.status}</Td>
            </Tr>
          ))}*/}
        </Tbody>
      </Table>
    </>
  );
};
