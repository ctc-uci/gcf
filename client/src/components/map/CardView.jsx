import React, { useEffect, useState } from 'react';

import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Skeleton,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { formatMonthYear } from '@/utils/formatDate';
import { isoCodeToFlagIconCode } from '@/utils/isoCodeToFlagIconCode';

import 'flag-icons/css/flag-icons.min.css';

import { GetCity, GetCountries, GetState } from 'react-country-state-city';
import { FaMusic, FaRegCalendar, FaUser } from 'react-icons/fa';

/** Placeholder shown until instruments, students, partner, and location data have all loaded. */
export function ProgramCardSkeleton() {
  return (
    <Box
      minW="300px"
      w="300px"
      h="240px"
      borderRadius="md"
      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
      p={4}
    >
      <Flex
        mb="10px"
        gap={2}
      >
        <Skeleton
          height="22px"
          width="100px"
          borderRadius="6px"
        />
        <Skeleton
          height="22px"
          width="88px"
          borderRadius="6px"
          ml="auto"
        />
      </Flex>
      <Skeleton
        height="24px"
        width="85%"
        mb={2}
        borderRadius="md"
      />
      <Skeleton
        height="14px"
        width="65%"
        mb={4}
        borderRadius="md"
      />
      <Skeleton
        height="1px"
        width="100%"
        mb={4}
      />
      <HStack
        justify="center"
        gap={6}
        pt={1}
      >
        <Skeleton
          height="72px"
          width="56px"
          borderRadius="md"
        />
        <Skeleton
          height="72px"
          width="56px"
          borderRadius="md"
        />
        <Skeleton
          height="72px"
          width="56px"
          borderRadius="md"
        />
      </HStack>
    </Box>
  );
}

const CardView = ({
  programId,
  title,
  city,
  country,
  state,
  status,
  started,
}) => {
  const [countryName, setCountryName] = useState('');
  const [flagCode, setFlagCode] = useState('');
  const [cityName, setCityName] = useState('');
  const [instruments, setInstruments] = useState(0);
  const [students, setStudents] = useState(0);
  const [partnerOrg, setPartnerOrg] = useState('');
  const [isReady, setIsReady] = useState(false);
  const { backend } = useBackendContext();

  useEffect(() => {
    if (!programId) {
      setIsReady(false);
      return;
    }

    let cancelled = false;

    const loadInstruments = async () => {
      const res = await backend.get(`/program/${programId}/instruments`);
      const total = res.data.reduce(
        (sum, inst) => sum + Number(inst.quantity),
        0
      );
      if (!cancelled) setInstruments(total);
    };

    const loadStudents = async () => {
      const res = await backend.get(`/program/students/${programId}`);
      const total = res.data.reduce(
        (sum, row) =>
          sum + Number(row.enrollmentChange) - Number(row.graduatedChange),
        0
      );
      if (!cancelled) setStudents(total);
    };

    const loadPartnerOrg = async () => {
      const res = await backend.get(
        `/program/${programId}/partner-organization`
      );
      if (!cancelled) setPartnerOrg(res.data);
    };

    const loadLocationNames = async () => {
      const fetchCountry = await backend.get(`/country/${country}`);
      const countries = await GetCountries();
      const foundCountry = countries.find(
        (c) => String(c.iso3) === String(fetchCountry.data.isoCode)
      );

      if (!foundCountry) return;

      if (!cancelled) {
        setCountryName(foundCountry.name);
        setFlagCode(isoCodeToFlagIconCode(fetchCountry.data.isoCode));
      }

      const states = await GetState(parseInt(foundCountry.id));
      const foundState = states.find((s) => parseInt(s.id) === parseInt(state));

      if (!foundState) return;

      const cities = await GetCity(foundCountry.id, foundState.id);
      const foundCity = cities.find((c) => parseInt(c.id) === parseInt(city));
      if (foundCity && !cancelled) setCityName(foundCity.name);
    };

    const loadAll = async () => {
      setIsReady(false);
      setInstruments(0);
      setStudents(0);
      setPartnerOrg('');
      setCountryName('');
      setFlagCode('');
      setCityName('');

      try {
        await Promise.allSettled([
          loadInstruments().catch((error) => {
            console.error('Error fetching instruments: ', error);
          }),
          loadStudents().catch((error) => {
            console.error('Error fetching students: ', error);
          }),
          loadPartnerOrg().catch((error) => {
            console.error('Error fetching partner organization: ', error);
          }),
          loadLocationNames().catch((error) => {
            console.error('Error fetching location data: ', error);
          }),
        ]);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [programId, city, country, state, backend]);

  if (!isReady) {
    return <ProgramCardSkeleton />;
  }

  return (
    <Card
      w="300px"
      h="240px"
      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
    >
      <CardHeader>
        <Flex mb="10px">
          <Badge
            bg="#2C7A7B"
            color="white"
            borderRadius="6px"
            pl="8px"
            pr="8px"
          >
            {partnerOrg}
          </Badge>
          <Spacer />
          <Badge
            bg={status === 'Inactive' ? '#FEEBCB' : '#E6FFFA'}
            color={status === 'Inactive' ? '#7B341E' : '#2C7A7B'}
            borderRadius="6px"
            pl="8px"
            pr="8px"
            textTransform="none"
          >
            <HStack>
              <Text>{status === 'Inactive' ? 'Developing' : 'Launched'}</Text>
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={status === 'Inactive' ? '#7B341E' : '#2C7A7B'}
              />
            </HStack>
          </Badge>
        </Flex>
        <Heading
          size="md"
          mb="5px"
          fontSize="20px"
        >
          {title}
        </Heading>
        <Text fontSize="14px">
          {flagCode && (
            <span
              className={`fi fi-${flagCode}`}
              aria-hidden="true"
            />
          )}{' '}
          {cityName ? `${cityName}, ${countryName}` : countryName}
        </Text>
      </CardHeader>

      <Divider borderColor="gray.100" />

      <CardBody>
        <HStack
          gap={2}
          justify="center"
        >
          <VStack>
            <Icon
              as={FaMusic}
              color="#2C7A7B"
            />
            <Text
              fontWeight="bold"
              fontSize="16px"
            >
              {instruments}
            </Text>
            <Text
              color="#6A7282"
              fontSize="12px"
            >
              Instruments
            </Text>
          </VStack>

          <Divider
            orientation="vertical"
            h="60px"
            borderColor="gray.200"
          />

          <VStack>
            <Icon
              as={FaUser}
              color="#2C7A7B"
            />
            <Text
              fontWeight="bold"
              fontSize="16px"
            >
              {students}
            </Text>
            <Text
              color="#6A7282"
              fontSize="12px"
            >
              Students
            </Text>
          </VStack>

          <Divider
            orientation="vertical"
            h="60px"
            borderColor="gray.200"
          />

          <VStack>
            <Icon
              as={FaRegCalendar}
              color="#2C7A7B"
            />
            <Text
              fontWeight="bold"
              fontSize="16px"
            >
              {formatMonthYear(started)}
            </Text>
            <Text
              color="#6A7282"
              fontSize="12px"
            >
              Started
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default CardView;
