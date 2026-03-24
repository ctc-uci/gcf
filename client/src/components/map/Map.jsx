import { React, useEffect, useState } from 'react';

import { Box, Heading, Text, VStack } from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const geoUrl = '/map-data.json';

export const Map = () => {
  const [regions, setRegions] = useState([]);
  const { backend } = useBackendContext();

  const handleCountry = async (geo) => {
    const iso = geo.id;
    try {
      const countriesRes = await backend.get(`/country/iso/${iso}`);
      const countriesData = countriesRes.data;

      const regionsRes = await backend.get(
        `/region/${countriesData.regionId}/countries`
      );
      setRegions(regionsRes.data);
    } catch (error) {
      console.error('Error fetching country or region data:', error);
    }
  };

  return (
    <>
      <Box
        bg="#2C7A7B"
        w="100%"
        p="20px"
        mb="30px"
      >
        <Heading
          color="white"
          mb="5px"
        >
          {' '}
          Global Impact{' '}
        </Heading>
        <Text color="white"> Explore our Programs and Impact </Text>
      </Box>
      <Box
        borderRadius="md"
        boxShadow="md"
        borderWidth="1px"
        w="90%"
        h="60%"
        mx="auto"
      >
        <ComposableMap>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountry(geo)}
                  style={{
                    default: {
                      fill: regions.some((r) => r.isoCode === geo.id)
                        ? '#636363'
                        : '#B3B3B3',
                      outline: 'none',
                    },
                    hover: { fill: '#868686', outline: 'none' },
                    pressed: { fill: '#636363', outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>
      </Box>
      <Heading
        fontSize="xl"
        mt="15px"
      >
        {' '}
        Featured Programs{' '}
      </Heading>
    </>
  );
};
