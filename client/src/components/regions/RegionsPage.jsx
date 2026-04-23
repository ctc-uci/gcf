import { useState } from 'react';

import { Box, Button, Flex, Heading } from '@chakra-ui/react';

import RegionsForm from '@/components/regions/RegionsForm';
import { RegionsGrid } from '@/components/regions/RegionsGrid';
import { useTranslation } from 'react-i18next';

export const RegionsPage = () => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEditRegion = (region, regionalDirectors) => {
    setSelectedRegion({ ...region, regionalDirectors });
    setIsDrawerOpen(true);
  };

  const handleNewRegion = () => {
    setSelectedRegion(null);
    setIsDrawerOpen(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsDrawerOpen(false);
  };

  return (
    <Box
      p={8}
      pt={0}
    >
      <Flex
        align="center"
        justify="space-between"
        mb={4}
        mt={4}
      >
        <Heading
          as="h1"
          size="lg"
          fontWeight="500"
        >
          {t('regions.pageTitle')}
        </Heading>
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
          onClick={handleNewRegion}
        >
          {t('regions.newRegion')}
        </Button>
      </Flex>

      <RegionsGrid
        onEditRegion={handleEditRegion}
        refreshTrigger={refreshTrigger}
      />

      <RegionsForm
        isOpen={isDrawerOpen}
        region={selectedRegion}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleRefresh}
        onDelete={handleRefresh}
      />
    </Box>
  );
};
