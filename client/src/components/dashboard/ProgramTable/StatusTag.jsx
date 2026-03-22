import { Box } from '@chakra-ui/react';

import { STATUS_TAG_STYLES } from './programTableTagConstants';

export function StatusTag({ status }) {
  const normalized = String(status ?? '').toLowerCase();
  const style = STATUS_TAG_STYLES[normalized] ?? {
    label: status ?? '—',
    bg: 'gray.100',
    color: 'gray.700',
  };
  return (
    <Box
      as="span"
      display="inline-block"
      px={2}
      py={0.5}
      borderRadius="md"
      fontSize="sm"
      fontWeight="medium"
      bg={style.bg}
      color={style.color}
    >
      {style.label}
    </Box>
  );
}
