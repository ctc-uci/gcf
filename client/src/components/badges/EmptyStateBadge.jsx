import { Box, Center, Icon, Text, VStack } from '@chakra-ui/react';
import { FiBell, FiUsers } from 'react-icons/fi';
import { HiOutlineMusicalNote } from 'react-icons/hi2';
import { IoHomeOutline } from 'react-icons/io5';

const BADGE_CONFIG = {
  'no-accounts': {
    icon: FiUsers,
    message:
      "No accounts have been created yet. Click 'New Account' to get started.",
  },
  'no-programs': {
    icon: HiOutlineMusicalNote,
    message:
      "No programs have been created yet. Click 'New Program' to get started.",
  },
  'no-updates': {
    icon: FiBell,
    message: 'No updates have been made yet.',
  },

  // when is this used (come back to it later) lwk should be program instead of region
  'no-program-region-assigned': {
    icon: IoHomeOutline,
    message:
      'Your account is all set! A GCF Admin will assign you to a region shortly.',
  },
};

/**
 * Reusable empty-state badge shown when a table/section has no data.
 * @param {'no-accounts' | 'no-programs' | 'no-updates' | 'no-program-region-assigned'} variant
 */
export function EmptyStateBadge({ variant = 'no-updates' }) {
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
    <Center minH="60vh" w="100%" py={12} px={4}>
      <Box
        w={size}
        h={size}
        minW={0}
        borderRadius="full"
        bg="gray.100"
        overflow="hidden"
      >
        <Center w="100%" h="100%">
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
              {config.message}
            </Text>
          </VStack>
        </Center>
      </Box>
    </Center>
  );
}
