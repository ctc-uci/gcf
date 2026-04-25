import { Box, Center, Icon, Text, VStack } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { FiBell, FiUsers } from 'react-icons/fi';
import { HiOutlineMusicalNote } from 'react-icons/hi2';
import { IoHomeOutline } from 'react-icons/io5';
import { MdOutlineHandshake } from 'react-icons/md';

const BADGE_CONFIG = {
  'no-accounts': {
    icon: FiUsers,
    messageKey: 'emptyState.noAccounts',
  },
  'no-programs': {
    icon: HiOutlineMusicalNote,
    messageKey: 'emptyState.noPrograms',
  },
  'no-updates': {
    icon: FiBell,
    messageKey: 'emptyState.noUpdates',
  },
  'no-partners': {
    icon: MdOutlineHandshake,
    messageKey: 'emptyState.noPartners',
  },
};

/**
 * Reusable empty-state badge shown when a table/section has no data.
 * @param {'no-accounts' | 'no-programs' | 'no-updates'} variant
 */
export function EmptyStateBadge({ variant = 'no-updates' }) {
  const { t } = useTranslation();
  const config = BADGE_CONFIG[variant];
  if (!config) return null;

  const IconComponent = config.icon;

  const size = {
    base: 'min(320px, 90vw)',
    sm: 'min(360px, 75vw)',
    md: 'min(380px, 55vw)',
    lg: '420px',
    xl: '440px',
  };

  return (
    <Center
      minH="60vh"
      w="100%"
      py={12}
      px={4}
    >
      <Box
        w={size}
        h={size}
        minW={0}
        borderRadius="full"
        bg="gray.100"
        overflow="hidden"
      >
        <Center
          w="100%"
          h="100%"
        >
          <VStack
            spacing={{ base: 4, md: 5 }}
            align="center"
            justify="center"
            w="80%"
          >
            <Icon
              as={IconComponent}
              boxSize={28}
              color="gray.500"
              aria-hidden
            />
            <Text
              color="gray.600"
              fontSize={{ base: 'sm', md: 'md' }}
              lineHeight="tall"
              textAlign="center"
              whiteSpace="normal"
              wordBreak="break-word"
              overflowWrap="break-word"
            >
              {t(config.messageKey)}
            </Text>
          </VStack>
        </Center>
      </Box>
    </Center>
  );
}
