import { useEffect, useRef, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { formatMonthYear } from '@/utils/formatDate';
import { isoCodeToFlagIconCode } from '@/utils/isoCodeToFlagIconCode';

import 'flag-icons/css/flag-icons.min.css';

import { GetCity, GetCountries, GetState } from 'react-country-state-city';
import {
  BsCalendar2,
  BsFillRecordFill,
  BsMusicNoteBeamed,
  BsPersonFill,
} from 'react-icons/bs';

const ProgramInfoView = ({ program }) => {
  const { backend } = useBackendContext();
  const [students, setStudents] = useState(0);
  const [instrumentsList, setInstrumentsList] = useState([]);
  const [totalInstruments, setTotalInstruments] = useState(0);
  const [directors, setDirectors] = useState([]);
  const [media, setMedia] = useState([]);
  const [mediaUrls, setMediaUrls] = useState({});
  const [directorPicUrls, setDirectorPicUrls] = useState({});
  const [locationName, setLocationName] = useState('');
  const [flagCode, setFlagCode] = useState('');
  const [partnerOrg, setPartnerOrg] = useState('');
  const galleryRef = useRef(null);

  const programId = program.id;

  const formatDateRange = (launchDate) => {
    const start = formatMonthYear(launchDate);
    const end = new Date().toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instrumentsRes, studentsRes, directorsRes, mediaRes] =
          await Promise.all([
            backend.get(`/program/${programId}/instruments`),
            backend.get(`/program/students/${programId}`),
            backend.get(`/program/${programId}/program-directors`),
            backend.get(`/program/${programId}/media`),
          ]);

        setInstrumentsList(instrumentsRes.data);
        const total = instrumentsRes.data.reduce(
          (sum, inst) => sum + Number(inst.quantity),
          0
        );
        setTotalInstruments(total);

        const totalStudents = studentsRes.data.reduce(
          (sum, row) =>
            sum + Number(row.enrollmentChange) - Number(row.graduatedChange),
          0
        );
        setStudents(totalStudents);

        setDirectors(directorsRes.data);

        const approvedMedia = mediaRes.data.filter(
          (m) => m.status === 'Approved'
        );
        const displayMedia =
          approvedMedia.length > 0 ? approvedMedia : mediaRes.data;
        setMedia(displayMedia);

        const urls = {};
        for (const m of displayMedia) {
          try {
            const urlRes = await backend.get(
              `/images/url/${encodeURIComponent(m.s3Key || m.s3_key)}`
            );
            urls[m.id] = urlRes.data.url;
          } catch (error) {
            console.error('Error fetching media: ', error);
          }
        }
        setMediaUrls(urls);

        const picUrls = {};
        for (const d of directorsRes.data) {
          if (d.picture) {
            try {
              const urlRes = await backend.get(
                `/images/url/${encodeURIComponent(d.picture)}`
              );
              picUrls[d.userId] = urlRes.data.url;
            } catch (error) {
              console.error('Error fetching media: ', error);
            }
          }
        }
        setDirectorPicUrls(picUrls);
      } catch (error) {
        console.error('Error fetching program details:', error);
      }
    };

    const fetchPartnerOrg = async () => {
      try {
        const partnerRes = await backend.get(
          `/program/${programId}/partner-organization`
        );
        setPartnerOrg(partnerRes.data);
      } catch (error) {
        console.error('Error fetching partner organization: ', error);
      }
    };

    fetchData();
    fetchPartnerOrg();
  }, [programId, backend]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const countryRes = await backend.get(`/country/${program.country}`);
        const countries = await GetCountries();
        const foundCountry = countries.find(
          (c) => String(c.iso3) === String(countryRes.data.isoCode)
        );
        if (foundCountry) {
          let name = foundCountry.name;
          setFlagCode(isoCodeToFlagIconCode(countryRes.data.isoCode));
          if (program.state) {
            const states = await GetState(parseInt(foundCountry.id));
            const foundState = states.find(
              (s) => parseInt(s.id) === parseInt(program.state)
            );
            if (foundState) {
              const cities = await GetCity(foundCountry.id, foundState.id);
              const foundCity = cities.find(
                (c) => parseInt(c.id) === parseInt(program.city)
              );
              name = foundCity
                ? `${foundCity.name}, ${foundCountry.name}`
                : foundCountry.name;
            }
          }
          setLocationName(name);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };
    fetchLocation();
  }, [program.country, program.state, program.city, backend]);

  return (
    <Flex
      direction="column"
      align="center"
      px="40px"
      py="32px"
      gap="32px"
      bg="white"
      mx="28px"
      borderRadius="12px"
    >
      <VStack
        align="flex-start"
        spacing="12px"
        w="100%"
      >
        <Badge
          bg="#2C7A7B"
          color="white"
          borderRadius="6px"
          px="12px"
          h="25px"
          display="flex"
          alignItems="center"
          fontSize="12px"
          fontWeight="500"
          textTransform="none"
        >
          {partnerOrg}
        </Badge>
        <Heading
          fontWeight="700"
          fontSize="36px"
          lineHeight="48px"
          letterSpacing="-0.85px"
          color="#101828"
        >
          {program.title}
        </Heading>
        <HStack spacing="8px">
          {flagCode && (
            <span
              className={`fi fi-${flagCode}`}
              aria-hidden="true"
            />
          )}
          <Text
            fontSize="12px"
            lineHeight="28px"
            letterSpacing="-0.44px"
            color="#4A5565"
          >
            {locationName}
          </Text>
        </HStack>
      </VStack>

      <VStack
        align="flex-start"
        spacing="24px"
        w="100%"
      >
        <Heading
          fontWeight="700"
          fontSize="28px"
          lineHeight="44px"
          color="#000000"
        >
          Program Overview
        </Heading>

        <Flex
          gap="40px"
          w="100%"
          justify="space-between"
        >
          <Box
            w="100%"
            h="218px"
            bgGradient="linear(135deg, #FFFFFF 0%, rgba(240, 253, 250, 0.3) 100%)"
            border="1px solid rgba(203, 251, 241, 0.5)"
            boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)"
            borderRadius="16px"
            position="relative"
            px="25px"
            pt="57px"
          >
            <Icon
              as={BsPersonFill}
              color="#319795"
              boxSize="24px"
              mb="8px"
            />
            <Text
              fontWeight="700"
              fontSize="36px"
              lineHeight="40px"
              letterSpacing="0.37px"
              color="#101828"
            >
              {students}
            </Text>
            <Text
              fontWeight="500"
              fontSize="14px"
              lineHeight="20px"
              letterSpacing="-0.15px"
              color="#4A5565"
              mt="8px"
            >
              Students Enrolled
            </Text>
          </Box>

          <Box
            w="100%"
            h="218px"
            bgGradient="linear(135deg, #FFFFFF 0%, rgba(240, 253, 250, 0.3) 100%)"
            border="1px solid rgba(203, 251, 241, 0.5)"
            boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)"
            borderRadius="16px"
            position="relative"
            px="25px"
            pt="57px"
          >
            <Icon
              as={BsMusicNoteBeamed}
              color="#319795"
              boxSize="24px"
              mb="8px"
            />
            <Text
              fontWeight="700"
              fontSize="36px"
              lineHeight="40px"
              letterSpacing="0.37px"
              color="#101828"
            >
              {totalInstruments}
            </Text>
            <Text
              fontWeight="500"
              fontSize="14px"
              lineHeight="20px"
              letterSpacing="-0.15px"
              color="#4A5565"
              mt="8px"
            >
              instruments donated
            </Text>
            {instrumentsList.length > 0 && (
              <HStack
                spacing="16px"
                mt="8px"
              >
                {instrumentsList.map((inst) => (
                  <Text
                    key={inst.instrumentId}
                    fontWeight="500"
                    fontSize="14px"
                    lineHeight="20px"
                    letterSpacing="-0.15px"
                    color="#4A5565"
                  >
                    &bull; {inst.quantity} {inst.name}
                  </Text>
                ))}
              </HStack>
            )}
          </Box>

          <Box
            w="100%"
            h="218px"
            bgGradient="linear(135deg, #FFFFFF 0%, rgba(240, 253, 250, 0.3) 100%)"
            border="1px solid rgba(203, 251, 241, 0.5)"
            boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)"
            borderRadius="16px"
            position="relative"
            px="25px"
            pt="24px"
          >
            <Badge
              bg="#E6FFFA"
              color="#2C7A7B"
              borderRadius="6px"
              px="8px"
              h="24px"
              display="flex"
              alignItems="center"
              gap="8px"
              fontSize="14px"
              fontWeight="500"
              textTransform="none"
              position="absolute"
              right="24px"
              top="24px"
            >
              {program.status === 'Inactive' ? 'Developing' : 'Launched'}
              <Icon
                as={BsFillRecordFill}
                color="#319795"
                boxSize="16px"
              />
            </Badge>
            <Box mt="33px">
              <Icon
                as={BsCalendar2}
                color="#319795"
                boxSize="24px"
                mb="8px"
              />
              <Text
                fontWeight="700"
                fontSize="30px"
                lineHeight="40px"
                letterSpacing="0.37px"
                color="#101828"
              >
                {formatDateRange(program.launchDate)}
              </Text>
              <Text
                fontWeight="500"
                fontSize="14px"
                lineHeight="20px"
                letterSpacing="-0.15px"
                color="#4A5565"
                mt="8px"
              >
                Program Timeline
              </Text>
            </Box>
          </Box>
        </Flex>
      </VStack>

      {directors.length > 0 && (
        <Box
          w="100%"
          bg="#E6FFFA"
          boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
          borderRadius="12px"
          p="24px"
        >
          <Heading
            fontWeight="600"
            fontSize="28px"
            lineHeight="44px"
            color="#000000"
            mb="24px"
          >
            {directors.length > 1 ? 'Meet the Directors' : 'Meet the Director'}
          </Heading>
          {directors.map((director) => (
            <Flex
              key={director.userId}
              gap="32px"
              align="flex-start"
              pb="20px"
            >
              <Image
                src={directorPicUrls[director.userId]}
                alt={`${director.firstName} ${director.lastName}`}
                w="175px"
                h="175px"
                borderRadius="12px"
                objectFit="cover"
                flexShrink={0}
                fallback={
                  <Flex
                    w="175px"
                    h="175px"
                    borderRadius="12px"
                    bg="gray.200"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon
                      as={BsPersonFill}
                      boxSize="60px"
                      color="gray.400"
                    />
                  </Flex>
                }
              />
              <VStack
                align="flex-start"
                spacing="12px"
                flex={1}
              >
                <VStack
                  align="flex-start"
                  spacing="8px"
                >
                  <Text
                    fontWeight="700"
                    fontSize="24px"
                    lineHeight="29px"
                    color="#000000"
                  >
                    {director.firstName} {director.lastName}
                  </Text>
                  <Text
                    fontWeight="700"
                    fontSize="16px"
                    lineHeight="19px"
                    color="#319795"
                  >
                    Program Director
                  </Text>
                </VStack>
              </VStack>
            </Flex>
          ))}
        </Box>
      )}

      {media.length > 0 && (
        <VStack
          align="flex-start"
          spacing="24px"
          w="100%"
          py="24px"
        >
          <Heading
            fontWeight="600"
            fontSize="28px"
            lineHeight="44px"
            color="#000000"
          >
            Gallery
          </Heading>
          <HStack
            ref={galleryRef}
            spacing="16px"
            overflowX="auto"
            w="100%"
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {media.map((m) =>
              mediaUrls[m.id] ? (
                <Box
                  key={m.id}
                  position="relative"
                  w="300px"
                  h="300px"
                  flexShrink={0}
                  borderRadius="12px"
                  overflow="hidden"
                  filter="drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))"
                  role="group"
                  cursor="pointer"
                >
                  <Image
                    src={mediaUrls[m.id]}
                    alt={m.fileName || m.file_name}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                  <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    bg="blackAlpha.600"
                    sx={{
                      opacity: 0,
                      '[role=group]:hover &': { opacity: 1 },
                    }}
                    transition="opacity 0.3s"
                    direction="column"
                    justify="flex-end"
                    p="16px"
                  >
                    <Text
                      color="white"
                      fontWeight="700"
                      fontSize="16px"
                      lineHeight="20px"
                    >
                      {m.fileName || m.file_name}
                    </Text>
                    {m.description && (
                      <Text
                        color="whiteAlpha.800"
                        fontSize="13px"
                        lineHeight="18px"
                        mt="4px"
                      >
                        {m.description}
                      </Text>
                    )}
                  </Flex>
                </Box>
              ) : null
            )}
          </HStack>
        </VStack>
      )}

      <Flex
        w="100%"
        h="300px"
        bgGradient="linear(100.45deg, #FFFFFF -34.33%, #20ABA8 50.52%, #FFFFFF 123.24%)"
        boxShadow="0px 5px 3px rgba(0, 0, 0, 0.45)"
        borderRadius="12px"
        justify="center"
        align="center"
        py="8px"
      >
        <VStack
          h="300px"
          justify="center"
        >
          <Heading
            fontWeight="600"
            fontSize="40px"
            lineHeight="70px"
            color="white"
            textAlign="center"
          >
            Make a difference Today
          </Heading>
          <Button
            as="a"
            href="https://givebutter.com/Donate-GCF"
            target="_blank"
            bg="white"
            color="#2C7A7B"
            borderRadius="12px"
            px="48px"
            h="70px"
            fontSize="20px"
            fontWeight="600"
            lineHeight="56px"
            boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
            _hover={{ bg: 'gray.50' }}
          >
            Donate Now
          </Button>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default ProgramInfoView;
