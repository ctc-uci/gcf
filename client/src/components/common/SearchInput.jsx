import { useRef, useState } from 'react';

import {
  Box,
  HStack,
  Input,
  List,
  ListItem,
  Text,
  useOutsideClick,
} from '@chakra-ui/react';

export function SearchInput({
  items = [],
  value,
  onChange,
  onSelectExisting,
  onCreateNew,
  placeholder = 'Search instrument',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  const searchLower = (value || '').trim().toLowerCase();
  const filtered = searchLower
    ? items.filter((inst) =>
        (inst.name || '').toLowerCase().includes(searchLower)
      )
    : items;
  const exactMatch = items.some(
    (inst) => (inst.name || '').toLowerCase() === searchLower
  );
  const canAddNew = searchLower.length > 0 && !exactMatch;

  const handleSelectExisting = (instrument) => {
    onSelectExisting?.(instrument);
    onChange?.('');
    setIsOpen(false);
  };

  const handleAddNew = () => {
    if (!searchLower) return;
    onCreateNew?.(value.trim());
    onChange?.('');
    setIsOpen(false);
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      width="100%"
      minW="12rem"
    >
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
      />
      {isOpen && (filtered.length > 0 || canAddNew) && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={10}
          mt={1}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="md"
          maxH="12rem"
          overflowY="auto"
        >
          <List
            spacing={0}
            py={1}
          >
            {filtered.map((item) => (
              <ListItem
                key={item.id}
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => handleSelectExisting(item)}
              >
                {item.name}
              </ListItem>
            ))}
            {canAddNew && (
              <ListItem
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'teal.50' }}
                onClick={handleAddNew}
                borderTopWidth={filtered.length ? 1 : 0}
                borderColor="gray.100"
              >
                <HStack
                  spacing={3}
                  align="center"
                >
                  <Text>+</Text>
                  <Text>Add new &quot;{value.trim()}&quot;</Text>
                </HStack>
              </ListItem>
            )}
          </List>
        </Box>
      )}
    </Box>
  );
}
