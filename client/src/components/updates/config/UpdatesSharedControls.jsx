import { HamburgerIcon } from '@chakra-ui/icons';
import {
  Divider,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineSquares2X2,
} from 'react-icons/hi2';

import { FilterComponent } from '../../common/FilterComponent';

export function UpdatesSearchInput({ value, onChange, maxW = '200px' }) {
  const { t } = useTranslation();
  const searchInputStyles = {
    placeholder: t('common.search'),
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
  return (
    <InputGroup maxW={maxW}>
      <InputLeftElement
        pointerEvents="none"
        h="32px"
      >
        <Icon
          as={FiSearch}
          color="gray.400"
          boxSize="14px"
        />
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
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label={t('common.filter')}
          icon={<HiOutlineAdjustmentsHorizontal />}
          variant="ghost"
          color="gray.500"
          size="sm"
        />
      </PopoverTrigger>
      <PopoverContent
        w="800px"
        maxW="90vw"
        shadow="xl"
      >
        <FilterComponent
          columns={columns}
          onFilterChange={onFilterChange}
        />
      </PopoverContent>
    </Popover>
  );
}
