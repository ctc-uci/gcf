import { Box, SimpleGrid } from '@chakra-ui/react';

import { RegionCard } from '@/components/regions/RegionCard';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import useSWR from 'swr';

export const RegionsGrid = ({ onEditRegion, refreshTrigger }) => {
  const { backend } = useBackendContext();

  const { data, error } = useSWR(
    ['regions-and-countries', refreshTrigger],
    async () => {
      const [regionsRes, countriesRes] = await Promise.all([
        backend.get(`/region/`),
        backend.get(`/region/countries-by-region`),
      ]);

      return {
        regions: Array.isArray(regionsRes.data) ? regionsRes.data : [],
        countriesByRegion: countriesRes.data || {},
      };
    }
  );

  if (error) {
    console.error('Error fetching regions:', error);
  }

  const regions = data?.regions || [];
  const countriesByRegion = data?.countriesByRegion || {};

  return (
    <Box>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        spacing={10}
      >
        {regions.map((region) => (
          <RegionCard
            key={region.id}
            region={region}
            onEdit={onEditRegion}
            countries={countriesByRegion[region.id] || []}
            refreshTrigger={refreshTrigger}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};
