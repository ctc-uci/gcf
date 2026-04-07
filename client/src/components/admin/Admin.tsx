import { Box, Text } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

export const Admin = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Text>{t('admin.message')}</Text>
    </Box>
  );
};
