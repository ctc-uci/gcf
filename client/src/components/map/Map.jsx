import { React, useEffect, useRef, useState } from 'react';

import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import {
  FaChevronLeft,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaRedo,
  FaRegArrowAltCircleLeft,
} from 'react-icons/fa';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

import CardView, { ProgramCardSkeleton } from './CardView.jsx';
import ProgramInfoView from './ProgramInfoView.jsx';

const geoUrl = '/map-data.json';

export const Map = () => {
  const [allCountries, setAllCountries] = useState([]);
  const [regionMap, setRegionMap] = useState({});
  const [regions, setRegions] = useState([]);
  const [regionName, setRegionName] = useState('');
  const [hoverRegions, setHoverRegions] = useState(null);
  /** Set synchronously on country click so the whole region highlights without waiting for the API. */
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const { backend } = useBackendContext();

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 8;

  const handleZoomIn = () => {
    setPosition((p) => ({
      ...p,
      zoom: Math.min(p.zoom * 1.5, MAX_ZOOM),
    }));
  };

  const handleZoomOut = () => {
    setPosition((p) => ({
      ...p,
      zoom: Math.max(p.zoom / 1.5, MIN_ZOOM),
    }));
  };

  const handleZoomReset = () => {
    setPosition({ coordinates: [0, 0], zoom: 1 });
  };

  const handleMoveEnd = (newPosition) => {
    setPosition(newPosition);
  };

  const scrollRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const tooltipRef = useRef(null);

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y };
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${x + 12}px`;
      tooltipRef.current.style.top = `${y - 28}px`;
    }
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
      setSelectedRegionId(countriesRegion);
      const regionsRes = await backend.get(
        `/region/${countriesRegion}/countries`
      );
      if (regionsRes.data.length === 0) {
        console.error('No regions found for the selected country.');
        setSelectedRegionId(null);
        return;
      }
      setSelectedProgram(null);
      setRegions(regionsRes.data);
      setPrograms([]);
      setProgramsLoading(true);

      try {
        const programRes = await backend.get(
          `/program/region/${regionsRes.data[0].regionId}`
        );
        setPrograms(programRes.data);
      } catch (error) {
        console.error('Error fetching programs for the region:', error);
        setPrograms([]);
      } finally {
        setProgramsLoading(false);
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
      setSelectedRegionId(null);
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
        position="relative"
        w="96%"
        mx="auto"
      >
        <Box
          ref={mapContainerRef}
          borderRadius="md"
          boxShadow="md"
          borderWidth="1px"
          w="100%"
          h="600px"
          position="relative"
          overflow="hidden"
          onMouseMove={handleMouseMove}
          onClick={() => {
            setPrograms([]);
            setProgramsLoading(false);
            setRegions([]);
            setSelectedRegionId(null);
            setSelectedProgram(null);
          }}
        >
          <ComposableMap style={{ height: '700px', width: '100%' }}>
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              onMoveEnd={handleMoveEnd}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const regionId = getRegionFromIso(geo.id);
                    const isHovered = regionId && regionId === hoverRegions;
                    const isSelectedRegion =
                      regionId != null &&
                      selectedRegionId != null &&
                      regionId === selectedRegionId;
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
                              : isSelectedRegion
                                ? '#636363'
                                : '#B3B3B3',
                            outline: 'none',
                          },
                          hover: {
                            fill: regionId ? '#868686' : '#B3B3B3',
                            outline: 'none',
                            cursor: regionId ? 'pointer' : 'default',
                          },
                          pressed: {
                            fill: regionId ? '#868686' : '#B3B3B3',
                            outline: 'none',
                            cursor: regionId ? 'pointer' : 'default',
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          <VStack
            position="absolute"
            top="12px"
            right="12px"
            spacing={1}
            zIndex={11}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              aria-label="Zoom in"
              icon={<FaPlus />}
              size="sm"
              bg="white"
              color="gray.700"
              boxShadow="md"
              _hover={{ bg: 'gray.100' }}
              isDisabled={position.zoom >= MAX_ZOOM}
              onClick={handleZoomIn}
            />
            <IconButton
              aria-label="Zoom out"
              icon={<FaMinus />}
              size="sm"
              bg="white"
              color="gray.700"
              boxShadow="md"
              _hover={{ bg: 'gray.100' }}
              isDisabled={position.zoom <= MIN_ZOOM}
              onClick={handleZoomOut}
            />
            <IconButton
              aria-label="Reset zoom"
              icon={<FaRedo />}
              size="sm"
              bg="white"
              color="gray.700"
              boxShadow="md"
              _hover={{ bg: 'gray.100' }}
              onClick={handleZoomReset}
            />
          </VStack>

          {hoverRegions && regionMap[hoverRegions] && (
            <Box
              ref={tooltipRef}
              position="absolute"
              left={`${mousePosRef.current.x + 12}px`}
              top={`${mousePosRef.current.y - 28}px`}
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

        {regions.length > 0 && selectedProgram && (
          <>
            <Box
              position="absolute"
              top="0"
              left="0"
              w="100%"
              h="100%"
              bg="blackAlpha.500"
              zIndex={19}
              borderRadius="md"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProgram(null);
              }}
              cursor="pointer"
            />
            <Box
              position="absolute"
              top="0"
              left="0"
              w="100%"
              h="100%"
              bg="white"
              zIndex={20}
              borderRadius="md"
              boxShadow="lg"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  background: '#CBD5E0',
                  borderRadius: '3px',
                },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Flex
                mt="15px"
                ml="25px"
                mr="25px"
                mb="10px"
                alignItems="center"
              >
                <HStack>
                  <Icon
                    as={FaRegArrowAltCircleLeft}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProgram(null);
                    }}
                    cursor="pointer"
                    boxSize={6}
                  />
                  <Heading fontSize="2xl">{selectedProgram.title}</Heading>
                </HStack>
              </Flex>
              <ProgramInfoView program={selectedProgram} />
            </Box>
          </>
        )}

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
                    setPrograms([]);
                    setProgramsLoading(false);
                    setRegions([]);
                    setSelectedRegionId(null);
                    setSelectedProgram(null);
                  }}
                  cursor="pointer"
                  boxSize={6}
                />
                <Heading fontSize="2xl">
                  Featured Programs in{' '}
                  {programsLoading || !regionName ? (
                    <Skeleton
                      as="span"
                      display="inline-block"
                      height="1em"
                      width="200px"
                      verticalAlign="text-bottom"
                      borderRadius="md"
                    />
                  ) : (
                    regionName
                  )}
                </Heading>
              </HStack>

              {!programsLoading && programs.length > 0 && (
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

            {programsLoading ? (
              <Box w="100%">
                <HStack
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
                  {[0, 1, 2].map((i) => (
                    <ProgramCardSkeleton key={i} />
                  ))}
                </HStack>
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
                      border="2px solid transparent"
                      borderRadius="md"
                      _hover={{
                        borderColor: 'teal.500',
                      }}
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
      </Box>
    </>
  );
};
