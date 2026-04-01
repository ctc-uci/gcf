import { React, useEffect, useRef, useState } from 'react';

import { Box, Flex, Heading, HStack, Icon, Text } from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegArrowAltCircleLeft,
} from 'react-icons/fa';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

import CardView from './CardView.jsx';

const geoUrl = '/map-data.json';

export const Map = () => {
  const [allCountries, setAllCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [regionName, setRegionName] = useState('');
  const [hoverRegions, setHoverRegions] = useState(null);
  const [display, setDisplay] = useState('block');
  const [programs, setPrograms] = useState([]);
  const { backend } = useBackendContext();

  const scrollRef = useRef(null);

  const scroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

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
      if (regionsRes.data.length === 0) {
        console.error('No regions found for the selected country.');
        return;
      }
      setDisplay('none');
      setRegions(regionsRes.data);

      try {
        const programRes = await backend.get(
          `/program/country/${regionsRes.data[0].regionId}`
        );
        setPrograms(programRes.data);
      } catch (error) {
        console.error('Error fetching programs for the region:', error);
        setPrograms([]);
        return;
      }

      try {
        const region = await backend.get(
          `/region/${regionsRes.data[0].regionId}`
        );
        setRegionName(region.data.name);
      } catch (error) {
        console.error('Error fetching region name', error);
        return;
      }
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
        display={display}
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
        w="96%"
        h="600px"
        mx="auto"
        onClick={() => {
          setPrograms([]);
          setRegions([]);
          setDisplay('block');
        }}
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
                    onClick={() => {
                      handleCountry(geo);
                    }}
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
      {regions.length > 0 && (
        <>
          <Flex
            mt="15px"
            ml="25px"
            mr="25px"
            mb="10px"
            justifyContent="space-between"
            alignItems="center"
          >
            <HStack>
              <Icon
                as={FaRegArrowAltCircleLeft}
                onClick={() => {
                  setPrograms([]);
                  setRegions([]);
                  setDisplay('block');
                }}
                cursor="pointer"
                boxSize={6}
              />
              <Heading fontSize="2xl">
                Featured Programs in {regionName}
              </Heading>
            </HStack>

            {programs.length > 0 && (
              <HStack gap={3}>
                <Flex
                  as="button"
                  onClick={() => scroll(-330)}
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg="#319795"
                  color="white"
                  align="center"
                  justify="center"
                  _hover={{ bg: '#2C7A7B' }}
                  transition="all 0.2s"
                >
                  <Icon as={FaChevronLeft} />
                </Flex>
                <Flex
                  as="button"
                  onClick={() => scroll(330)}
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg="#319795"
                  color="white"
                  align="center"
                  justify="center"
                  _hover={{ bg: '#2C7A7B' }}
                  transition="all 0.2s"
                >
                  <Icon as={FaChevronRight} />
                </Flex>
              </HStack>
            )}
          </Flex>

          {programs.length > 0 ? (
            <Box w="100%">
              <HStack
                ref={scrollRef}
                ml="28px"
                mb="20px"
                pr="28px"
                gap={7}
                overflowX="auto"
                pb="10px"
                css={{
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }}
              >
                {programs.map((program) => (
                  <Box
                    key={program.id}
                    minW="300px"
                  >
                    <CardView
                      programId={program.id}
                      title={program.title}
                      city={program.city}
                      country={program.country}
                      state={program.state}
                      status={program.status}
                      started={program.launchDate}
                    />
                  </Box>
                ))}
              </HStack>
            </Box>
          ) : (
            <Text
              ml="28px"
              mb="20px"
              fontSize="lg"
              color="gray.600"
              fontStyle="italic"
            >
              No Programs in this Region!
            </Text>
          )}
        </>
      )}
    </>
  );
};
