import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
} from '@chakra-ui/react';

import { BsArrowDownUp } from 'react-icons/bs';
import { FiGrid, FiList, FiPlus, FiSearch } from 'react-icons/fi';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
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
    <Flex width="100%" align="center" gap={6}>
      <Spacer />
      <InputGroup w="280px">
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
          pr={9}
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <InputRightElement h="32px" w="32px">
          <Popover>
            <PopoverTrigger>
              <IconButton
                aria-label="Filter"
                icon={<HiOutlineAdjustmentsHorizontal size={18} />}
                variant="ghost"
                color="gray.600"
                size="sm"
                minW="auto"
                h="24px"
                w="24px"
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
        </InputRightElement>
      </InputGroup>

      <HStack spacing={6} align="center">
        <IconButton
          aria-label="Sort"
          icon={<BsArrowDownUp size={20} />}
          variant="ghost"
          color="gray.600"
          w="20px"
          h="20px"
          minW="20px"
          p={0}
        />
        <HStack w="48px" h="20px" spacing="4px" align="center" justify="center">
          <IconButton
            aria-label="List View"
            icon={<FiList size={20} />}
            variant="ghost"
            color="teal.500"
            size="sm"
            minW="auto"
            h="20px"
            w="20px"
            p={0}
            onClick={() => setIsCardView(false)}
          />
          <IconButton
            aria-label="Grid View"
            icon={<FiGrid size={20} />}
            variant="ghost"
            color="gray.600"
            size="sm"
            minW="auto"
            h="20px"
            w="20px"
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
