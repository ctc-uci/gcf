import { useEffect } from "react";

import {
  Badge,
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";

import { FiEdit2, FiEyeOff } from "react-icons/fi";

import { useTableSort } from "../../contexts/hooks/TableSort";
import { SortArrows } from "../tables/SortArrows";

export const AccountsTable = ({
  data,
  setData,
  originalData,
  searchQuery,
  onUpdate,
}) => {
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const { sortOrder, handleSort } = useTableSort(originalData, setData);

  useEffect(() => {
    function filterUpdates(search) {
      if (search === "") {
        setData(originalData);
        return;
      }
      // filter by search query
      const filtered = originalData.filter(
        (update) =>
          // if no search then show everything
          update.email.toLowerCase().includes(search.toLowerCase()) ||
          update.firstName.toLowerCase().includes(search.toLowerCase()) ||
          update.programs.some((program) =>
            program.toLowerCase().includes(search.toLowerCase())
          )
      );
      setData(filtered);
    }

    filterUpdates(searchQuery);
  }, [searchQuery, originalData, setData]);

  return (
    <TableContainer>
      <Table
        variant="simple"
        size="md"
      >
        <Thead>
          <Tr>
            <Th
              onClick={() => handleSort("firstName")}
              cursor="pointer"
              color="black"
              fontSize="sm"
              textTransform="none"
              fontWeight="bold"
            >
              Name
              <SortArrows
                columnKey="firstName"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("email")}
              cursor="pointer"
              color="black"
              fontSize="sm"
              textTransform="none"
              fontWeight="bold"
            >
              Email
              <SortArrows
                columnKey="email"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("password")}
              cursor="pointer"
              color="black"
              fontSize="sm"
              textTransform="none"
              fontWeight="bold"
            >
              Password
              <SortArrows
                columnKey="passsword"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("role")}
              cursor="pointer"
              color="black"
              fontSize="sm"
              textTransform="none"
              fontWeight="bold"
            >
              Type
              <SortArrows
                columnKey="role"
                sortOrder={sortOrder}
              />
            </Th>
            <Th
              onClick={() => handleSort("programs")}
              cursor="pointer"
              color="black"
              fontSize="sm"
              textTransform="none"
              fontWeight="bold"
            >
              Program(s)
              <SortArrows
                columnKey="programs"
                sortOrder={sortOrder}
              />
            </Th>
            <Th width="50px"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {!data ||
            (data.length === 0 && (
              <Center py={10}>
                <Text color="gray.500">No accounts found.</Text>
              </Center>
            ))}

          {data.map((user) => (
            <Tr
              key={user.id}
              _hover={{
                bg: hoverBg,
                "& .action-group": { opacity: 1, visibility: "visible" },
              }}
              transition="background 0.2s"
            >
              <Td fontWeight="medium">
                {user.firstName} {user.lastName}
              </Td>

              <Td>{user.email}</Td>

              <Td>
                <HStack spacing={2}>
                  {/* TODO: Update to utilize password field when data is available + hidden functionality */}
                  <Text
                    fontSize="lg"
                    lineHeight="1"
                    mt="6px"
                  >
                    ********
                  </Text>
                  <Icon
                    as={FiEyeOff}
                    color="gray.500"
                    cursor="pointer"
                  />
                </HStack>
              </Td>

              <Td>
                <Badge
                  px={4}
                  py={1}
                  borderRadius="full"
                  bg="gray.200"
                  color="gray.800"
                  textTransform="capitalize"
                  fontWeight="normal"
                  fontSize="sm"
                >
                  {user.role}
                </Badge>
              </Td>

              <Td>
                {Array.isArray(user.programs) && user.programs.length > 0
                  ? user.programs.join(", ")
                  : "-"}
              </Td>

              <Td
                p={0}
                textAlign="right"
              >
                <Box
                  className="action-group"
                  opacity={0}
                  visibility="hidden"
                  transition="all 0.2s"
                  pr={4}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiEdit2 />}
                    colorScheme="gray"
                    bg="white"
                    onClick={() => onUpdate(user)}
                  >
                    Update
                  </Button>
                </Box>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
