import { Badge } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

export const PDStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const s = (status || '').toLowerCase();
  let bg = 'gray.100';
  let color = 'gray.700';
  if (s === 'pending' || s === 'unresolved') {
    bg = 'red.100';
    color = 'red.600';
  } else if (
    s === 'reviewed' ||
    s === 'resolved' ||
    s === 'approved' ||
    s === 'active'
  ) {
    bg = 'green.100';
    color = 'green.600';
  }
  return (
    <Badge
      bg={bg}
      color={color}
      borderRadius="full"
      px={3}
      py={1}
      fontSize="xs"
      fontWeight="500"
      textTransform="capitalize"
    >
      {status || t('common.pending')}
    </Badge>
  );
};
