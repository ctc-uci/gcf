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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import {
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";
import { FiDownload, FiFilter, FiGrid, FiList, FiSearch } from "react-icons/fi";
import { FilterComponent } from "../common/FilterComponent";

export const AccountToolbar = ({ searchQuery, setSearchQuery, onNew, columns, setActiveFilters, resultCount }) => {
  // TODO: Implement functionality for search, filter, view toggle, download, and new account
  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
  }
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
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </InputGroup>

      <HStack spacing={2}>
      <Popover>
        <PopoverTrigger>
          <IconButton
            aria-label="Filter"
            icon={<HiOutlineAdjustmentsHorizontal />}
            variant="ghost"
            color="gray.500"
          />
        </PopoverTrigger>
        <PopoverContent w="800px" maxW="90vw" shadow="xl">
          <FilterComponent
            columns={columns}
            onFilterChange={(filters) => setActiveFilters(filters)}
          />
        </PopoverContent>
      </Popover>
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
        <Text fontSize="sm" color="gray.500">
          Displaying {resultCount} results
        </Text>
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
        onClick = {onNew}
      >
        New
      </Button>
    </Flex>
  );
};
