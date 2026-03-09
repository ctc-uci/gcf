import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
} from '@chakra-ui/react';

import { FiGrid, FiList, FiPlus, FiSearch } from 'react-icons/fi';
import {
  HiArrowsUpDown,
  HiOutlineAdjustmentsHorizontal,
} from 'react-icons/hi2';
import { FilterComponent } from '../common/FilterComponent';

export const AccountToolbar = ({
  searchQuery,
  setSearchQuery,
  onNew,
  setIsCardView,
  columns,
  onFilterChange,
}) => {
  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
  }

  return (
    <Flex width="100%" align="center" gap={4}>
      <Spacer />
      <InputGroup w="222px">
        <InputLeftElement pointerEvents="none" h="32px">
          <Icon as={FiSearch} color="gray.600" boxSize="14px" />
        </InputLeftElement>

        <Input
          placeholder="Search"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="4px"
          h="32px"
          fontSize="sm"
          _focus={{ borderColor: 'gray.400' }}
          _placeholder={{ color: 'gray.400' }}
          pl={8}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </InputGroup>

      <HStack spacing={1} align="center">
        <Popover>
          <PopoverTrigger>
            <IconButton
              aria-label="Filter"
              icon={<HiOutlineAdjustmentsHorizontal size={20} />}
              variant="ghost"
              color="gray.600"
              size="sm"
              minW="auto"
              h="20px"
              p={0}
            />
          </PopoverTrigger>
          <PopoverContent w="800px" maxW="90vw" shadow="xl">
            <FilterComponent
              columns={columns}
              onFilterChange={onFilterChange}
            />
          </PopoverContent>
        </Popover>
        <IconButton
          aria-label="Sort"
          icon={<HiArrowsUpDown size={20} />}
          variant="ghost"
          color="gray.600"
          size="sm"
          minW="auto"
          h="20px"
          p={0}
        />
        <HStack spacing={1} align="center">
          <IconButton
            aria-label="List View"
            icon={<FiList size={20} />}
            variant="ghost"
            color="teal.500"
            size="sm"
            minW="auto"
            h="20px"
            p={0}
            onClick={() => setIsCardView(false)}
          />
          <Box
            w="0px"
            h="16px"
            borderLeft="1.5px solid"
            borderColor="gray.600"
          />
          <IconButton
            aria-label="Grid View"
            icon={<FiGrid size={20} />}
            variant="ghost"
            color="gray.600"
            size="sm"
            minW="auto"
            h="20px"
            p={0}
            onClick={() => setIsCardView(true)}
          />
        </HStack>
      </HStack>

      <Spacer />

      <Button
        bg="teal.500"
        color="white"
        _hover={{ bg: 'teal.600' }}
        borderRadius="6px"
        fontWeight="semibold"
        fontSize="sm"
        size="sm"
        h="32px"
        px={3}
        leftIcon={<FiPlus />}
        onClick={onNew}
      >
        New Account
      </Button>
    </Flex>
  );
};
