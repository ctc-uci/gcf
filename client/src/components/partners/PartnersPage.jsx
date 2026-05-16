import { useCallback, useEffect, useState } from 'react';

import { Box, Button, Flex, Text } from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

import PartnerForm from './PartnerForm';
import { PartnersTable } from './PartnersTable';

export const PartnersPage = () => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const fetchPartners = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await backend.get('/partners');
      setPartners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setIsLoading(false);
    }
  }, [backend]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleEdit = (partner) => {
    setSelectedPartner(partner);
    setIsDrawerOpen(true);
  };

  const handleNew = () => {
    setSelectedPartner(null);
    setIsDrawerOpen(true);
  };

  const handleRefresh = () => {
    fetchPartners();
    setIsDrawerOpen(false);
  };

  return (
    <Box>
      <Flex
        align="center"
        justify="space-between"
        mb={4}
        mt={4}
      >
        <Text
          fontSize="2xl"
          fontWeight="semibold"
        >
          {t('partners.pageTitle')}
        </Text>
        <Button
          size="sm"
          color="white"
          bg="teal.500"
          _hover={{
            color: 'teal.500',
            bg: 'white',
            border: '2px solid',
            borderColor: 'teal.500',
          }}
          onClick={handleNew}
        >
          {t('partners.newPartner')}
        </Button>
      </Flex>

      <PartnersTable
        partners={partners}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      <PartnerForm
        isOpen={isDrawerOpen}
        partner={selectedPartner}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleRefresh}
        onDelete={handleRefresh}
      />
    </Box>
  );
};
