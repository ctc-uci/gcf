import {
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react';
import { FiSearch, FiList } from 'react-icons/fi';
import {
  HiOutlineAdjustmentsHorizontal,
  HiArrowsUpDown,
} from 'react-icons/hi2';
import { BsGrid3X3Gap } from 'react-icons/bs';

import { FilterComponent } from '../common/FilterComponent';

const searchInputStyles = {
  placeholder: 'Search',
  bg: 'white',
  border: '1px solid',
  borderColor: 'gray.200',
  borderRadius: '4px',
  h: '32px',
  fontSize: 'sm',
  _focus: { borderColor: 'gray.400' },
  _placeholder: { color: 'gray.400' },
  pl: 8,
};

export function UpdatesSearchInput({ value, onChange, maxW = '200px' }) {
  return (
    <InputGroup maxW={maxW}>
      <InputLeftElement pointerEvents="none" h="32px">
        <Icon as={FiSearch} color="gray.400" boxSize="14px" />
      </InputLeftElement>
      <Input
        {...searchInputStyles}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </InputGroup>
  );
}

export function UpdatesFilterPopover({ columns, onFilterChange }) {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="Filter"
          icon={<HiOutlineAdjustmentsHorizontal />}
          variant="ghost"
          color="gray.500"
          size="sm"
        />
      </PopoverTrigger>
      <PopoverContent w="800px" maxW="90vw" shadow="xl">
        <FilterComponent columns={columns} onFilterChange={onFilterChange} />
      </PopoverContent>
    </Popover>
  );
}
/** List / grid view toggle (visual only; wire actions when needed). */
export function UpdatesViewModeToggle() {
  return (
    <HStack
      spacing={0}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
    >
      <IconButton
        aria-label="List view"
        icon={<FiList />}
        variant="ghost"
        size="sm"
        color="gray.500"
        borderRadius="md"
      />
      <IconButton
        aria-label="Grid view"
        icon={<BsGrid3X3Gap />}
        variant="ghost"
        size="sm"
        color="gray.500"
        borderRadius="md"
      />
    </HStack>
  );
}
