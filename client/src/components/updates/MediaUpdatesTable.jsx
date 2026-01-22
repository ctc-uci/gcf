import {
  Flex,
  Heading,
  IconButton,
  Input,
  Table,
  TableContainer,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export const MediaUpdatesTable = ({ mediaData }) => {
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
        </Table>
      </TableContainer>
    </>
  );
};
