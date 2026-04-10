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
import ProgramInfoView from './ProgramInfoView.jsx';

const geoUrl = '/map-data.json';

export const Map = () => {
  const [allCountries, setAllCountries] = useState([]);
  const [regionMap, setRegionMap] = useState({});
  const [regions, setRegions] = useState([]);
  const [regionName, setRegionName] = useState('');
  const [hoverRegions, setHoverRegions] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const { backend } = useBackendContext();

  const scrollRef = useRef(null);
  const mapContainerRef = useRef(null);

  const scroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [countriesRes, regionsRes] = await Promise.all([
          backend.get('/country'),
          backend.get('/region'),
        ]);
        setAllCountries(countriesRes.data);
        const map = {};
        for (const r of regionsRes.data) {
          map[r.id] = r.name;
        }
        setRegionMap(map);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, [backend]);

  const handleMouseMove = (e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const getRegionFromIso = (iso) => {
    const countries = allCountries.find((c) => c.isoCode === iso);
    return countries ? countries.regionId : null;
  };

  const handleCountry = async (geo) => {
    const iso = geo.id;
    try {
      const countriesRegion = getRegionFromIso(iso);
      if (!countriesRegion) {
        return;
      }
      const regionsRes = await backend.get(
        `/region/${countriesRegion}/countries`
      );
      if (regionsRes.data.length === 0) {
        console.error('No regions found for the selected country.');
        return;
      }
      setSelectedProgram(null);
      setRegions(regionsRes.data);

      try {
        const programRes = await backend.get(
          `/program/region/${regionsRes.data[0].regionId}`
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
        ref={mapContainerRef}
        borderRadius="md"
        boxShadow="md"
        borderWidth="1px"
        w="96%"
        h="600px"
        mx="auto"
        position="relative"
        overflow="hidden"
        onMouseMove={handleMouseMove}
        onClick={() => {
          setPrograms([]);
          setRegions([]);
          setSelectedProgram(null);
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
                    onClick={(e) => {
                      e.stopPropagation();
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
                        fill: regionId ? '#868686' : '#B3B3B3',
                        outline: 'none',
                        cursor: regionId ? 'pointer' : 'default',
                      },
                      pressed: { fill: '#636363', outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {hoverRegions && regionMap[hoverRegions] && (
          <Box
            position="absolute"
            left={`${mousePos.x + 12}px`}
            top={`${mousePos.y - 28}px`}
            bg="gray.800"
            color="white"
            px={3}
            py={1}
            borderRadius="md"
            fontSize="sm"
            fontWeight="semibold"
            pointerEvents="none"
            zIndex={10}
            whiteSpace="nowrap"
          >
            {regionMap[hoverRegions]}
          </Box>
        )}
      </Box>
      {regions.length > 0 && (
        <Box onClick={(e) => e.stopPropagation()}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedProgram) {
                    setSelectedProgram(null);
                  } else {
                    setPrograms([]);
                    setRegions([]);
                    setSelectedProgram(null);
                  }
                }}
                cursor="pointer"
                boxSize={6}
              />
              <Heading fontSize="2xl">
                {selectedProgram
                  ? selectedProgram.title
                  : `Featured Programs in ${regionName}`}
              </Heading>
            </HStack>

            {programs.length > 0 && !selectedProgram && (
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

          {selectedProgram ? (
            <Box
              w="100%"
              maxH="600px"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  background: '#CBD5E0',
                  borderRadius: '3px',
                },
              }}
            >
              <ProgramInfoView program={selectedProgram} />
            </Box>
          ) : programs.length > 0 ? (
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
                    cursor="pointer"
                    onClick={() => setSelectedProgram(program)}
                    transition="transform 0.2s"
                    _hover={{ transform: 'scale(1.03)' }}
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
        </Box>
      )}
    </>
  );
};
