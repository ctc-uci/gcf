import { Badge, Tab, TabList } from '@chakra-ui/react';

export const UPDATES_TAB_SELECTED_PROPS = {
  color: 'black',
  borderBottom: '2px solid',
  borderColor: 'teal.400',
};

export const UPDATES_TAB_BASE_PROPS = {
  color: 'gray.500',
  fontWeight: '500',
  pb: 2,
  px: 0,
  mr: 6,
};

export function UpdatesTabCountBadge({ count }) {
  return (
    <Badge
      ml={2}
      bg="gray.200"
      color="gray.600"
      borderRadius="0.33em"
      fontSize="xs"
      px={2}
    >
      {count}
    </Badge>
  );
}
