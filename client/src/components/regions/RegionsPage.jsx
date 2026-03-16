import { useState } from 'react';

import { Box, Button, Flex, Text } from '@chakra-ui/react';

import RegionsForm from '@/components/regions/RegionsForm';
import { RegionsGrid } from '@/components/regions/RegionsGrid';

export const RegionsPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEditRegion = (region, regionalDirector) => {
    setSelectedRegion({ ...region, regionalDirector });
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
          Regions
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
          onClick={handleNewRegion}
        >
          + New Region
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
