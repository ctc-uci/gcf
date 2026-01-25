import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Text,
} from "@chakra-ui/react";

import { FiDownload, FiFilter, FiGrid, FiList, FiSearch } from "react-icons/fi";

export const AccountToolbar = () => {
  return (
    <Flex
      width="100%"
      align="center"
      gap={2}
    >
      <InputGroup
        maxW="300px"
        ml={{ base: 0, md: 4 }}
      >
        <InputLeftElement
          pointerEvents="none"
          mt={-2}
        >
          <Icon
            as={FiSearch}
            color="gray.400"
          />
        </InputLeftElement>

        <Input
          placeholder="Type to search"
          variant="unstyled"
          borderBottom="1px solid"
          borderColor="gray.300"
          borderRadius={0}
          _focus={{ borderColor: "black" }}
          px={0}
          pl={10}
        />
      </InputGroup>

      <HStack spacing={2}>
        <IconButton
          aria-label="Filter"
          icon={<FiFilter />}
          variant="ghost"
          color="gray.500"
        />
        <HStack spacing={0}>
          <IconButton
            aria-label="List View"
            icon={<FiList />}
            variant="ghost"
            color="gray.500"
          />
          <IconButton
            aria-label="Grid View"
            icon={<FiGrid />}
            variant="ghost"
            color="gray.400"
          />
        </HStack>
        <IconButton
          aria-label="Download"
          icon={<FiDownload />}
          variant="ghost"
          color="gray.500"
        />
      </HStack>

      <Spacer />

      <Button
        variant="outline"
        borderRadius="md"
        fontWeight="normal"
        leftIcon={
          <Text
            as="span"
            fontSize="lg"
          >
            +
          </Text>
        }
      >
        New
      </Button>
    </Flex>
  );
};
