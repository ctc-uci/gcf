import { Box } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import { STATUS_TAG_STYLES } from './programTableTagConstants';

export function StatusTag({ status }) {
  const { t } = useTranslation();
  const normalized = String(status ?? '').toLowerCase();
  const mapKey =
    normalized === 'launched' || normalized === 'active'
      ? 'active'
      : normalized === 'developing' || normalized === 'inactive'
        ? 'inactive'
        : null;
  const style = mapKey != null ? STATUS_TAG_STYLES[mapKey] : null;
  const label =
    mapKey === 'active'
      ? t('programStatus.launched')
      : mapKey === 'inactive'
        ? t('programStatus.developing')
        : (status ?? t('common.emDash'));
  const colors = style ?? {
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
      bg={colors.bg}
      color={colors.color}
    >
      {label}
    </Box>
  );
}
