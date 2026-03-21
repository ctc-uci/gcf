import { Badge, Tab, TabList } from '@chakra-ui/react';

const tabSelected = {
  color: 'black',
  borderBottom: '2px solid',
  borderColor: 'teal.400',
};

const tabBase = {
  color: 'gray.500',
  fontWeight: '500',
  pb: 2,
  px: 0,
  mr: 6,
};

function CountBadge({ count }) {
  return (
    <Badge
      ml={2}
      bg="gray.200"
      color="gray.600"
      borderRadius="full"
      fontSize="xs"
      px={2}
    >
      {count}
    </Badge>
  );
}

/**
 * Program / Media / Account tabs with item counts (Admin + Regional Director layouts).
 */
export function UpdatesTabListWithBadges({
  programCount,
  mediaCount,
  accountCount,
}) {
  return (
    <TabList>
      <Tab _selected={tabSelected} {...tabBase}>
        Program
        <CountBadge count={programCount} />
      </Tab>
      <Tab _selected={tabSelected} {...tabBase}>
        Media
        <CountBadge count={mediaCount} />
      </Tab>
      <Tab _selected={tabSelected} {...tabBase}>
        Account
        <CountBadge count={accountCount} />
      </Tab>
    </TabList>
  );
}
