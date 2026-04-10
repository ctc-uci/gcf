import { useEffect, useState } from 'react';

import { Box, SimpleGrid } from '@chakra-ui/react';

import { RegionCard } from '@/components/regions/RegionCard';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

export const RegionsGrid = ({ onEditRegion, refreshTrigger }) => {
  const { backend } = useBackendContext();
  const [regions, setRegions] = useState([]);
  const [countriesByRegion, setCountriesByRegion] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regionsRes, countriesRes] = await Promise.all([
          backend.get(`/region/`),
          backend.get(`/region/countries-by-region`),
        ]);

        const regionsList = Array.isArray(regionsRes.data)
          ? regionsRes.data
          : [];
        setRegions(regionsList);
        setCountriesByRegion(countriesRes.data || {});
      } catch (err) {
        console.error('Error fetching regions:', err);
      }
    };

    fetchData();
  }, [backend, refreshTrigger]);

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
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};
