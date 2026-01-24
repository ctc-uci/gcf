import { GcfUserAccount } from "@/types/gcf-user";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Icon,
  Text,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEyeOff, FiEdit2 } from "react-icons/fi";

interface AccountsTableProps {
  data: GcfUserAccount[];
}

export const AccountsTable = ({ data }: AccountsTableProps) => {
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <TableContainer>
      <Table variant="simple" size="md">
        <Thead>
          <Tr>
            <Th color="black" fontSize="sm" textTransform="none" fontWeight="bold">Name</Th>
            <Th color="black" fontSize="sm" textTransform="none" fontWeight="bold">Email</Th>
            <Th color="black" fontSize="sm" textTransform="none" fontWeight="bold">Password</Th>
            <Th color="black" fontSize="sm" textTransform="none" fontWeight="bold">Type</Th>
            <Th color="black" fontSize="sm" textTransform="none" fontWeight="bold">Program(s)</Th>
            <Th width="50px"></Th>
          </Tr>
        </Thead>
        <Tbody>
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
                  <Text fontSize="lg" lineHeight="1" mt="6px">********</Text>
                  <Icon as={FiEyeOff} color="gray.500" cursor="pointer" />
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

              <Td>{user.program || "-"}</Td>

              <Td p={0} textAlign="right">
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