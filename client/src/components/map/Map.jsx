import { React, useEffect, useState } from 'react';

import { Box, Heading, Text } from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { FaRegArrowAltCircleLeft } from 'react-icons/fa';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

import CardView from './CardView.jsx';

const geoUrl = '/map-data.json';

export const Map = () => {
  const [allCountries, setAllCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [hoverRegions, setHoverRegions] = useState(null);
  const [programs, setPrograms] = useState([]);
  const { backend } = useBackendContext();

  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
        const res = await backend.get('/country');
        setAllCountries(res.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchAllCountries();
  }, [backend]);

  const getRegionFromIso = (iso) => {
    const countries = allCountries.find((c) => c.isoCode === iso);
    return countries ? countries.regionId : null;
  };

  const handleCountry = async (geo) => {
    const iso = geo.id;
    try {
      const countriesRegion = getRegionFromIso(iso);
      const regionsRes = await backend.get(
        `/region/${countriesRegion}/countries`
      );

      setRegions(regionsRes.data);

      console.log(regions);
      console.log(regions[0].regionId);

      const programRes = await backend.get(
        `/program/country/${countriesRegion}`
      );
      setPrograms(programRes.data);
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
          Global Impact
        </Heading>
        <Text color="white"> Explore our Programs and Impact </Text>
      </Box>
      <Box
        borderRadius="md"
        boxShadow="md"
        borderWidth="1px"
        w="90%"
        h="600px"
        mx="auto"
      >
        <ComposableMap style={{ height: '700px', width: '100%' }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const regionId = getRegionFromIso(geo.id);
                const isHovered = regionId && regionId === hoverRegions;
                const isClicked = regions.some((r) => r.isoCode === geo.id);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountry(geo)}
                    onMouseEnter={() => setHoverRegions(regionId)}
                    onMouseLeave={() => setHoverRegions(null)}
                    style={{
                      default: {
                        fill: isHovered
                          ? '#868686'
                          : isClicked
                            ? '#636363'
                            : '#B3B3B3',
                        outline: 'none',
                      },
                      hover: {
                        fill: isHovered ? '#868686' : '#868686',
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { fill: '#636363', outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </Box>
      {programs && (
        <>
          <Heading
            fontSize="xl"
            mt="15px"
          >
            Featured Programs
          </Heading>

          {programs.map((region, index) => (
            <CardView key={index} />
          ))}
        </>
      )}
    </>
  );
};
