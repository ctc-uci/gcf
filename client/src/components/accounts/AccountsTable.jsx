import { useEffect, useState } from "react";

import { EditIcon, EmailIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  IconButton,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { FiEdit2, FiEyeOff } from "react-icons/fi";

import { useTableSort } from "../../contexts/hooks/TableSort";
import { SortArrows } from "../tables/SortArrows";
import { FiEdit2, FiEyeOff } from "react-icons/fi";

const escapeCsvValue = (val) => {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export function downloadAccountsAsCsv(data) {
  if (!data || data.length === 0) return;
  const headers = ["First Name", "Last Name", "Email", "Type", "Program(s)"];
  const rows = data.map((user) => [
    escapeCsvValue(user.firstName),
    escapeCsvValue(user.lastName),
    escapeCsvValue(user.email),
    escapeCsvValue(user.role),
    escapeCsvValue(
      Array.isArray(user.programs) ? user.programs.join("; ") : ""
    ),
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `accounts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const AccountsTable = ({ data, setData, originalData, searchQuery, isCardView, onUpdate}) => {
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const { sortOrder, handleSort } = useTableSort(originalData, setData);
  const { backend } = useBackendContext();

  const RegionText = ({ id }) => {
    const [region, setRegion] = useState("");

    const fetch = async () => {
      const res = await backend.get(
        `/regional-directors/regional-director-region/${id}`
      );
      setRegion(res.data[0]?.name);
    };

    fetch();
    return <Text fontSize="sm">{region}</Text>;
  };

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
      {!isCardView ? (
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
      ) : (
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={6}
        >
          {data.map((a) => (
            <GridItem key={a.id}>
              <Card
                w={324}
                h={400}
                br={20}
              >
                <CardHeader position="relative">
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                  >
                    {/* TODO: add ability to open the account edit form onClick */}
                    <IconButton
                      aria-label="search"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      bg="#808080"
                      borderRadius="full"
                      color="white"
                      //onClick={() => openEditForm(a)}
                    />
                  </Box>
                  <Badge
                    borderRadius="full"
                    p={2}
                    bg="#808080"
                    color="white"
                  >
                    {a.role}
                  </Badge>
                </CardHeader>
                <CardBody position="relative">
                  <Center mt={10}>
                    {/* TODO: replace GCF Globe with an image associated with the program */}
                    <Image
                      src={GcfGlobe}
                      opacity="30%"
                      h={300}
                      position="absolute"
                      draggable="false"
                      alt="GCF Globe"
                      mt={10}
                    />
                  </Center>
                </CardBody>
                <CardFooter
                  bg="gray.200"
                  w="100%"
                  h="auto"
                  minh="20%"
                >
                  <VStack align="left">
                    <Text>
                      {a.firstName} {a.lastName}{" "}
                    </Text>
                    <VStack align="left">
                      <Flex
                        gap={3}
                        flexWrap="wrap"
                      >
                        {a.role === "Regional Director" ? (
                          <RegionText id={a.id} />
                        ) : (
                          a.programs.map((p) => <Text fontSize="sm">{p}</Text>)
                        )}
                      </Flex>
                    </VStack>
                  </VStack>
                  <Box
                    position="absolute"
                    bottom={5}
                    right={2}
                  >
                    <IconButton
                      aria-label="search"
                      icon={
                        <EmailIcon
                          w={5}
                          h={5}
                        />
                      }
                      size="sm"
                      variant="ghost"
                      bg="#808080"
                      borderRadius="full"
                      color="white"
                      w={10}
                      h={10}
                    />
                  </Box>
                </CardFooter>
              </Card>
            </GridItem>
          ))}
        </Grid>
      )}
    </TableContainer>
  );
};
